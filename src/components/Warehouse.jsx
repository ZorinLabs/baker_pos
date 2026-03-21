import React, { useState, useMemo } from 'react';
import { stores } from '../mockData';
import { Truck, Search, Bell, CheckCircle, XCircle, History, Lock, AlertTriangle } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const Warehouse = ({ inventory, items, storeRequests, pendingShipments, onDispatchSupply, onProcessRequest }) => {
    const [activeTab, setActiveTab] = useState('dispatch');
    const [isHistoryUnlocked, setIsHistoryUnlocked] = useState(false);
    const [historyPassword, setHistoryPassword] = useState('');

    const [selectedStore, setSelectedStore] = useState('1');
    const [supplyQty, setSupplyQty] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Interactive Confirmation Management
    const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null, type: 'primary' });

    const filteredItems = items.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingRequests = storeRequests.filter(r => r.status === 'pending');

    const handleUnlockHistory = (e) => {
        e.preventDefault();
        if (historyPassword === '123') {
            setIsHistoryUnlocked(true);
        } else {
            alert("Incorrect Warehouse Manager Security Pin");
        }
    };

    const openConfirm = (title, message, onConfirm, type = 'primary') => {
        setConfirmState({ open: true, title, message, onConfirm, type });
    };

    const handleSendSupply = (e) => {
        e.preventDefault();
        if (!selectedItem || !supplyQty || supplyQty <= 0) {
            alert("Please select an item and enter a valid quantity.");
            return;
        }
        const store = stores.find(s => s.id === parseInt(selectedStore));
        const item = items.find(i => i.id === selectedItem);

        openConfirm(
            "CONFIRM SHIPMENT",
            `Authorize the dispatch of ${supplyQty} units of ${item?.name} to ${store?.name}? This action will notify the branch manager immediately.`,
            () => {
                const storeId = parseInt(selectedStore);
                onDispatchSupply(storeId, selectedItem, parseInt(supplyQty));
                setSelectedItem('');
                setSupplyQty('');
                setConfirmState({ ...confirmState, open: false });
            }
        );
    };

    const onHandleProcess = (id, action, itemName) => {
        openConfirm(
            action === 'processed' ? "Confirm Intake" : "Reject Intake",
            `Are you sure you want to ${action} the request for ${itemName}?`,
            () => {
                onProcessRequest(id, action);
                setConfirmState({ ...confirmState, open: false });
            },
            action === 'processed' ? 'primary' : 'danger'
        );
    };

    return (
        <div className="warehouse-layout">
            <ConfirmModal
                isOpen={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState({ ...confirmState, open: false })}
                type={confirmState.type}
            />

            <div className="header-flex">
                <div>
                    <h1 className="page-title text-gradient">Saman's Logistics Portal</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Inventory dispatch and request verification</p>
                </div>
            </div>

            <div className="category-pills" style={{ marginTop: '24px', marginBottom: '24px' }}>
                <div className={`pill ${activeTab === 'dispatch' ? 'active' : ''}`} onClick={() => setActiveTab('dispatch')}>
                    <Truck size={14} style={{ marginRight: '6px' }} /> Shipment Control
                </div>
                <div className={`pill ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                    <History size={14} style={{ marginRight: '6px' }} /> Dispatch Logs
                </div>
            </div>

            {activeTab === 'dispatch' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
                    <div>
                        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Bell size={20} color="var(--primary)" /> Unconfirmed Intake Orders
                                {pendingRequests.length > 0 && <span className="badge danger">{pendingRequests.length}</span>}
                            </h3>
                            {pendingRequests.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>All store requests processed.</p>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Origin</th>
                                            <th>Target Outlet</th>
                                            <th>Product</th>
                                            <th>Qty</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingRequests.map(r => {
                                            const store = stores.find(s => s.id === r.storeId);
                                            const item = items.find(i => i.id === r.itemId);
                                            const isHighPriority = r.requestedBy === 'admin';
                                            return (
                                                <tr key={r.id} style={isHighPriority ? { borderLeft: '4px solid var(--danger)', background: 'rgba(255,0,0,0.05)' } : {}}>
                                                    <td style={{ fontWeight: isHighPriority ? 'bold' : 'normal', color: isHighPriority ? 'var(--danger)' : 'inherit' }}>
                                                        {isHighPriority && <AlertTriangle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                                                        {r.requestedBy.toUpperCase()}
                                                    </td>
                                                    <td>{store?.name}</td>
                                                    <td>{item?.name}</td>
                                                    <td>{r.qty}</td>
                                                    <td style={{ display: 'flex', gap: '6px' }}>
                                                        <button className="btn" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => onHandleProcess(r.id, 'processed', item?.name)}>
                                                            Confirm & Ship
                                                        </button>
                                                        {!isHighPriority && (
                                                            <button className="btn danger" style={{ padding: '4px 10px', fontSize: '11px', background: 'rgba(255,0,0,0.1)' }} onClick={() => onHandleProcess(r.id, 'rejected', item?.name)}>
                                                                Reject
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="glass-panel" style={{ padding: '24px' }}>
                            <h3>Manual Warehouse Discharge</h3>
                            <form onSubmit={handleSendSupply} style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Recipient Store</label>
                                        <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}>
                                            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Discharge Quantity</label>
                                        <input type="number" placeholder="Enter qty" value={supplyQty} onChange={(e) => setSupplyQty(e.target.value)} />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Select Stock Item</label>
                                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="text" placeholder="Locate item in warehouse..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingLeft: '40px' }} />
                                    </div>
                                    <select size="5" value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} style={{ padding: '8px' }}>
                                        <option value="" disabled>Search Results...</option>
                                        {filteredItems.map(item => (
                                            <option key={item.id} value={item.id}>[{item.category}] {item.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <button type="submit" className="btn" style={{ height: '56px' }}><Truck size={20} /> Authorize Truck Dispatch</button>
                            </form>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3>Store Inventory Mirror</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '12px' }}>Live stock at {stores.find(s => s.id === parseInt(selectedStore))?.name}</p>
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            <table style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Current Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => {
                                        const inv = inventory.find(i => i.storeId === parseInt(selectedStore) && i.itemId === item.id);
                                        const qty = inv ? inv.stock : 0;
                                        return (
                                            <tr key={item.id}>
                                                <td style={{ fontSize: '12px' }}>{item.name}</td>
                                                <td>{qty <= 5 ? <span className="badge danger">{qty}</span> : <span style={{ fontSize: '11px' }}>{qty}</span>}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="glass-panel" style={{ padding: '32px', minHeight: '400px' }}>
                    {!isHistoryUnlocked ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <Lock size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
                            <h3>Secure Logistics Audit</h3>
                            <form onSubmit={handleUnlockHistory} style={{ maxWidth: '300px', margin: '0 auto', display: 'flex', gap: '8px', marginTop: '24px' }}>
                                <input type="password" placeholder="Saman Access PIN" value={historyPassword} onChange={e => setHistoryPassword(e.target.value)} />
                                <button type="submit" className="btn">Unlock Log</button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <div className="header-flex" style={{ marginBottom: '24px' }}>
                                <h3>Warehouse Transaction Trail</h3>
                                <button className="btn secondary" onClick={() => setIsHistoryUnlocked(false)}>Re-Lock Archives</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <h4 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Intake Directive Resolution</h4>
                                    <table>
                                        <thead>
                                            <tr><th>Origin</th><th>Recipient</th><th>Resolution</th></tr>
                                        </thead>
                                        <tbody>
                                            {storeRequests.filter(r => r.status !== 'pending').map(r => (
                                                <tr key={r.id}>
                                                    <td style={{ fontSize: '12px' }}>{r.requestedBy.toUpperCase()}</td>
                                                    <td style={{ fontSize: '12px' }}>{stores.find(s => s.id === r.storeId)?.name}</td>
                                                    <td><span className={`badge ${r.status === 'processed' ? 'success' : 'danger'}`}>{r.status.toUpperCase()}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    <h4 style={{ marginBottom: '16px', color: 'var(--success)' }}>Authorized Discharge Trail</h4>
                                    <table>
                                        <thead>
                                            <tr><th>Outlet</th><th>Item</th><th>Units</th></tr>
                                        </thead>
                                        <tbody>
                                            {pendingShipments.map(s => (
                                                <tr key={s.id}>
                                                    <td style={{ fontSize: '12px' }}>{stores.find(st => st.id === s.storeId)?.name}</td>
                                                    <td style={{ fontSize: '12px' }}>{items.find(i => i.id === s.itemId)?.name}</td>
                                                    <td style={{ fontWeight: 'bold' }}>{s.qty}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Warehouse;
