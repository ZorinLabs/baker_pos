import React, { useMemo, useState } from 'react';
import { stores, items } from '../mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, ShoppingBag, Banknote, Calendar, Truck } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const AdminDashboard = ({ sales, inventory, items: allItems, pendingItems, futureOrders, onApprove, onReject, onWarehouseDirect }) => {
    const [selectedStore, setSelectedStore] = useState('All');
    const [showWhModal, setShowWhModal] = useState(false);
    const [whForm, setWhForm] = useState({ storeId: '1', itemId: '', qty: '' });

    // Interactive Confirmation Management
    const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });

    const filteredSales = useMemo(() => {
        return selectedStore === 'All' ? sales : sales.filter(s => s.storeId === parseInt(selectedStore));
    }, [sales, selectedStore]);

    const filteredFuture = useMemo(() => {
        return selectedStore === 'All' ? futureOrders : futureOrders.filter(o => o.storeId === parseInt(selectedStore));
    }, [futureOrders, selectedStore]);

    // Aggregate stats
    const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
    const totalOrders = filteredSales.length;

    const lowStockItems = useMemo(() => {
        let invs = inventory;
        if (selectedStore !== 'All') {
            invs = invs.filter(i => i.storeId === parseInt(selectedStore));
        }
        return invs.filter(i => i.stock <= i.lowStockThreshold).map(i => ({
            ...i,
            itemDetails: allItems.find(itm => itm.id === i.itemId),
            storeDetails: stores.find(st => st.id === i.storeId)
        }));
    }, [inventory, selectedStore, allItems]);

    // Daily revenue chart prep
    const chartData = useMemo(() => {
        const dataMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const str = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dataMap[str] = { name: str, Revenue: 0 };
        }

        filteredSales.forEach(sale => {
            const dateStr = new Date(sale.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (dataMap[dateStr]) {
                dataMap[dateStr].Revenue += sale.total;
            }
        });
        return Object.values(dataMap);
    }, [filteredSales]);

    const openConfirm = (title, message, onConfirm) => {
        setConfirmState({ open: true, title, message, onConfirm });
    };

    const handleWhSubmit = (e) => {
        e.preventDefault();
        const store = stores.find(s => s.id === parseInt(whForm.storeId));
        const item = allItems.find(i => i.id === whForm.itemId);

        openConfirm(
            "Dispatch Directive",
            `Issue an official order to ship ${whForm.qty} units of ${item?.name} to ${store?.name}?`,
            () => {
                onWarehouseDirect(parseInt(whForm.storeId), whForm.itemId, parseInt(whForm.qty), 'admin');
                setWhForm({ storeId: '1', itemId: '', qty: '' });
                setShowWhModal(false);
                setConfirmState({ ...confirmState, open: false });
            }
        );
    };

    return (
        <div>
            <ConfirmModal
                isOpen={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState({ ...confirmState, open: false })}
            />

            <div className="header-flex">
                <div>
                    <h1 className="page-title text-gradient">Owner Analytics</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Global business performance and logistics control</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn" onClick={() => setShowWhModal(true)}><Truck size={18} /> Instruct Warehouse</button>
                    <select
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        style={{ width: '200px' }}
                    >
                        <option value="All">All Stores</option>
                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card glass-panel">
                    <div className="stat-title">Total Revenue</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>Rs.{totalRevenue.toLocaleString()}</div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-title">Future Commitment</div>
                    <div className="stat-value" style={{ color: 'var(--primary)' }}>Rs.{filteredFuture.filter(o => o.status === 'pending').reduce((a, c) => a + c.total, 0).toLocaleString()}</div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-title">Avg Order Value</div>
                    <div className="stat-value" style={{ color: 'var(--warning)' }}>Rs.{(totalOrders > 0 ? totalRevenue / totalOrders : 0).toFixed(0)}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div className="chart-container glass-panel">
                    <h3 style={{ marginBottom: '20px' }}>Global Revenue Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" />
                            <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface)', border: 'none', borderRadius: '8px', color: 'white' }} />
                            <Line type="monotone" dataKey="Revenue" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle color="var(--danger)" /> Reorder Suggestions
                    </h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {lowStockItems.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--success)' }}>All inventory healthy!</div>
                        ) : (
                            <table style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Store</th>
                                        <th>Item</th>
                                        <th>Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockItems.map((lsi, i) => (
                                        <tr key={i}>
                                            <td>{lsi.storeDetails?.name}</td>
                                            <td style={{ fontSize: '12px' }}>{lsi.itemDetails?.name}</td>
                                            <td><span className="badge danger">{lsi.stock}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} color="var(--primary)" /> Future Orders Global View (Pending)
                </h3>
                {filteredFuture.filter(o => o.status === 'pending').length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No pending future orders.</p>
                ) : (
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Outlet</th>
                                <th>Customer</th>
                                <th>Order Total</th>
                                <th>Deposit Collected</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFuture.filter(o => o.status === 'pending').map(order => (
                                <tr key={order.id}>
                                    <td>{stores.find(s => s.id === order.storeId)?.name}</td>
                                    <td>{order.customerName}</td>
                                    <td>Rs.{order.total.toLocaleString()}</td>
                                    <td><span className="badge success">Rs.{order.deposit.toLocaleString()}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="glass-panel" style={{ marginTop: '24px', padding: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>Ownership Action Center</h3>
                {pendingItems.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>All product requests processed.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Proposed Item</th>
                                <th>Cat</th>
                                <th>Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingItems.map(p => (
                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td>{p.category}</td>
                                    <td>Rs.{p.price}</td>
                                    <td style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => onApprove(p.id)}>Approve</button>
                                        <button className="btn danger" style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => onReject(p.id)}>Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showWhModal && (
                <div className="glass-panel modal" style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    zIndex: 100, padding: '32px', width: '400px', background: 'var(--bg-color)',
                    border: '2px solid var(--primary)'
                }}>
                    <h3>Admin Logistics Directive</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Instruct warehouse to send stock to an outlet.</p>
                    <form onSubmit={handleWhSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <select value={whForm.storeId} onChange={e => setWhForm({ ...whForm, storeId: e.target.value })}>
                            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <select required value={whForm.itemId} onChange={e => setWhForm({ ...whForm, itemId: e.target.value })}>
                            <option value="">Select Product...</option>
                            {allItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                        <input type="number" placeholder="Direct Ship Quantity" required value={whForm.qty} onChange={e => setWhForm({ ...whForm, qty: e.target.value })} />
                        <button type="submit" className="btn">Issue Urgent Directive</button>
                        <button type="button" className="btn secondary" onClick={() => setShowWhModal(false)}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
