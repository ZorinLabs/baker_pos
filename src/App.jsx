import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import PosTerminal from './components/PosTerminal';
import Inventory from './components/Inventory';
import Warehouse from './components/Warehouse';
import OutletManager from './components/OutletManager';
import { initialInventory, initialSales, stores, items as initialItems, initialPendingItems, initialPendingShipments, initialFutureOrders, initialStoreRequests } from './mockData';
import { syncService } from './syncService';

function App() {
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('pos');
    const [isSyncing, setIsSyncing] = useState(false);

    // App-level state
    const [inventory, setInventory] = useState(initialInventory);
    const [sales, setSales] = useState(initialSales);
    const [items, setItems] = useState(initialItems);
    const [pendingItems, setPendingItems] = useState(initialPendingItems);
    const [pendingShipments, setPendingShipments] = useState(initialPendingShipments);
    const [futureOrders, setFutureOrders] = useState(initialFutureOrders);
    const [storeRequests, setStoreRequests] = useState(initialStoreRequests);

    // CLOUD SYNC LOGIC
    // Pull from cloud every 10 seconds for multi-device sync
    useEffect(() => {
        const fetchRemoteState = async () => {
            const remoteState = await syncService.loadState();
            if (remoteState) {
                setInventory(remoteState.inventory || initialInventory);
                setSales(remoteState.sales || initialSales);
                setItems(remoteState.items || initialItems);
                setPendingItems(remoteState.pendingItems || initialPendingItems);
                setPendingShipments(remoteState.pendingShipments || initialPendingShipments);
                setFutureOrders(remoteState.futureOrders || initialFutureOrders);
                setStoreRequests(remoteState.storeRequests || initialStoreRequests);
            }
        };

        fetchRemoteState();
        const interval = setInterval(fetchRemoteState, 10000);
        return () => clearInterval(interval);
    }, []);

    // UseEffect to push local changes to cloud whenever state changes
    useEffect(() => {
        if (!user) return; // Only sync when logged in
        const pushState = async () => {
            setIsSyncing(true);
            await syncService.saveState({
                inventory, sales, items, pendingItems, pendingShipments, futureOrders, storeRequests
            });
            setIsSyncing(false);
        };
        pushState();
    }, [inventory, sales, items, pendingItems, pendingShipments, futureOrders, storeRequests]);

    const handleLogin = (user) => {
        setUser(user);
        if (user.role === 'admin') setCurrentView('dashboard');
        else if (user.role === 'warehouse') setCurrentView('warehouse');
        else if (user.role === 'manager') setCurrentView('manager');
        else setCurrentView('pos');
    };

    const handleLogout = () => {
        setUser(null);
    };

    // State update helpers (these will trigger the cloud push useEffect)
    const handleAddSale = (storeId, saleItems, total) => {
        const newSale = { id: Math.random().toString(36).substr(2, 9), storeId, items: saleItems, total, timestamp: new Date().toISOString() };
        syncInventory(storeId, saleItems);
        setSales(prev => [...prev, newSale]);
    };

    const syncInventory = (storeId, saleItems) => {
        setInventory(prev => {
            const updated = [...prev];
            saleItems.forEach(si => {
                const idx = updated.findIndex(inv => inv.storeId === storeId && inv.itemId === si.item.id);
                if (idx !== -1) updated[idx] = { ...updated[idx], stock: Math.max(0, updated[idx].stock - si.qty) };
            });
            return updated;
        });
    };

    const handlePlaceFutureOrder = (order) => {
        setFutureOrders(prev => [...prev, { ...order, id: Date.now(), status: 'pending', timestamp: new Date().toISOString() }]);
    };

    const handleCompleteFutureOrder = (orderId) => {
        const order = futureOrders.find(o => o.id === orderId);
        if (!order) return;
        const balance = order.total - order.deposit;
        if (window.confirm(`Collect balance of Rs.${balance}?`)) {
            const newSale = { id: Math.random().toString(36).substr(2, 9), storeId: order.storeId, items: order.items, total: order.total, timestamp: new Date().toISOString(), type: 'future' };
            syncInventory(order.storeId, order.items);
            setSales(prev => [...prev, newSale]);
            setFutureOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
        }
    };

    const handleStoreToWhRequest = (storeId, itemId, qty, requestedBy = 'manager') => {
        setStoreRequests(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), storeId, itemId, qty, status: 'pending', requestedBy }]);
    };

    const handleProcessWhRequest = (requestId, status) => {
        const req = storeRequests.find(r => r.id === requestId);
        if (status === 'processed' && req) handleDispatchSupply(req.storeId, req.itemId, req.qty);
        setStoreRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    };

    const handleDispatchSupply = (storeId, itemId, qty) => {
        setPendingShipments(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), storeId, itemId, qty, status: 'shipped', timestamp: new Date().toISOString() }]);
    };

    const handleVerifyShipment = (shipmentId) => {
        const shipment = pendingShipments.find(s => s.id === shipmentId);
        if (shipment) {
            handleUpdateStock(shipment.storeId, shipment.itemId, 0, shipment.qty);
            setPendingShipments(prev => prev.map(s => s.id === shipmentId ? { ...s, status: 'delivered' } : s));
        }
    };

    const handleUpdateStock = (storeId, itemId, newStock, offset = null) => {
        setInventory(prev => {
            const idx = prev.findIndex(inv => inv.storeId === storeId && inv.itemId === itemId);
            if (idx === -1) return [...prev, { storeId, itemId, stock: offset !== null ? offset : newStock, lowStockThreshold: 5 }];
            return prev.map(inv => (inv.storeId === storeId && inv.itemId === itemId) ? { ...inv, stock: offset !== null ? inv.stock + offset : newStock } : inv);
        });
    };

    const handleRequestProduct = (newProduct) => {
        setPendingItems(prev => [...prev, { ...newProduct, id: 'pend_' + Math.random().toString(36).substr(2, 5) }]);
    };

    const handleApproveProduct = (pendingId) => {
        const product = pendingItems.find(p => p.id === pendingId);
        if (product) {
            setItems(prev => [...prev, { ...product, id: 'app_' + Math.random().toString(36).substr(2, 5) }]);
            setPendingItems(prev => prev.filter(p => p.id !== pendingId));
        }
    };

    const handleRejectProduct = (pId) => setPendingItems(prev => prev.filter(p => p.id !== pId));

    if (!user) return <Login onLogin={handleLogin} />;

    return (
        <div className="app-layout">
            {isSyncing && <div style={{ position: 'fixed', top: '10px', right: '10px', fontSize: '10px', color: 'var(--primary)', zIndex: 10000 }}>☁ Syncing...</div>}
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} user={user} onLogout={handleLogout} />
            <main className="main-content">
                {currentView === 'dashboard' && <AdminDashboard sales={sales} inventory={inventory} items={items} pendingItems={pendingItems} futureOrders={futureOrders} onApprove={handleApproveProduct} onReject={handleRejectProduct} onWarehouseDirect={handleStoreToWhRequest} />}
                {currentView === 'manager' && <OutletManager user={user} inventory={inventory} items={items} sales={sales} pendingShipments={pendingShipments} futureOrders={futureOrders} storeRequests={storeRequests} onUpdateStock={handleUpdateStock} onVerifyShipment={handleVerifyShipment} onRequestProduct={handleRequestProduct} onWarehouseRequest={handleStoreToWhRequest} />}
                {currentView === 'warehouse' && <Warehouse inventory={inventory} items={items} storeRequests={storeRequests} pendingShipments={pendingShipments} onDispatchSupply={handleDispatchSupply} onProcessRequest={handleProcessWhRequest} />}
                {currentView === 'pos' && <PosTerminal user={user} inventory={inventory} items={items} futureOrders={futureOrders} onAddSale={handleAddSale} onRequestProduct={null} onPlaceFutureOrder={handlePlaceFutureOrder} onCompleteFutureOrder={handleCompleteFutureOrder} />}
                {currentView === 'inventory' && <Inventory inventory={inventory} items={items} onUpdateStock={handleUpdateStock} />}
            </main>
        </div>
    );
}

export default App;
