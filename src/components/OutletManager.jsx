import React, { useState } from 'react';
import { stores } from '../mockData';
import { LayoutDashboard, Package, Bell, CheckCircle, PlusCircle, History, Lock, Truck, ShoppingCart, User, Phone, StickyNote } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const OutletManager = ({ user, inventory, items, sales, pendingShipments, futureOrders, storeRequests, onUpdateStock, onVerifyShipment, onRequestProduct, onWarehouseRequest }) => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [isHistoryUnlocked, setIsHistoryUnlocked] = useState(false);
    const [historyPassword, setHistoryPassword] = useState('');

    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestItem, setRequestItem] = useState({ name: '', category: 'Bakery', price: '', cost: '', image: '📦' });

    const [showWarehouseOrderModal, setShowWarehouseOrderModal] = useState(false);
    const [whOrder, setWhOrder] = useState({ itemId: '', qty: '' });

    // Interactive Confirmation Management
    const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });

    const storeName = stores.find(s => s.id === user.storeId)?.name;
    const storeInventory = inventory.filter(inv => inv.storeId === user.storeId);
    const storeSales = sales.filter(s => s.storeId === user.storeId);
    const myPendingShipments = pendingShipments.filter(s => s.storeId === user.storeId && (s.status === 'pending' || s.status === 'shipped'));
    const myFutureOrders = futureOrders.filter(o => o.storeId === user.storeId && o.status === 'pending');
    const completedFutureOrders = futureOrders.filter(o => o.storeId === user.storeId && o.status === 'completed');
    const myWhRequests = storeRequests.filter(r => r.storeId === user.storeId);

    const totalRevenue = storeSales.reduce((acc, s) => acc + s.total, 0);

    const handleUnlockHistory = (e) => {
        e.preventDefault();
        if (historyPassword === '123') {
            setIsHistoryUnlocked(true);
        } else {
            alert("Incorrect Manager Security Pin");
        }
    };

    const openConfirm = (title, message, onConfirm) => {
        setConfirmState({ open: true, title, message, onConfirm });
    };

    const handleSendRequest = (e) => {
        e.preventDefault();
        if (!requestItem.name || !requestItem.price) return;

        openConfirm(
            "Confirm Proposal",
            `Are you sure you want to propose ${requestItem.name} to the owner for Rs.${requestItem.price}?`,
            () => {
                onRequestProduct({ ...requestItem, price: Number(requestItem.price), cost: Number(requestItem.cost), storeId: user.storeId });
                setRequestItem({ name: '', category: 'Bakery', price: '', cost: '', image: '📦' });
                setShowRequestModal(false);
                setConfirmState({ ...confirmState, open: false });
            }
        );
    };

    const handleWhOrder = (e) => {
        e.preventDefault();
        const item = items.find(i => i.id === whOrder.itemId);

        openConfirm(
            "Authorize Reorder",
            `Send request for ${whOrder.qty} units of ${item?.name} to main warehouse?`,
            () => {
                onWarehouseRequest(user.storeId, whOrder.itemId, Number(whOrder.qty));
                setWhOrder({ itemId: '', qty: '' });
                setShowWarehouseOrderModal(false);
                setConfirmState({ ...confirmState, open: false });
            }
        );
    };

    return (
        <div className="mgr-container">
            <ConfirmModal
                isOpen={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState({ ...confirmState, open: false })}
            />

            <div className="header-flex">
                <div>
                    <h1 className="page-title text-gradient">{storeName} - Manager Portal</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Operations control and order audit</p>
                </div>
                <div className="stats-grid" style={{ marginBottom: 0, gap: '12px' }}>
                    <div className="stat-card glass-panel" style={{ padding: '12px 24px' }}>
                        <span className="stat-title" style={{ fontSize: '10px' }}>Total Store Revenue</span>
                        <div className="stat-value" style={{ fontSize: '18px' }}>Rs.{totalRevenue.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="category-pills" style={{ marginTop: '24px' }}>
                <div className={`pill ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
                    <Package size={14} style={{ marginRight: '6px' }} /> Stock
                </div>
                <div className={`pill ${activeTab === 'shipments' ? 'active' : ''}`} onClick={() => setActiveTab('shipments')}>
                    <Bell size={14} style={{ marginRight: '6px' }} /> Notifications {myPendingShipments.length > 0 && <span className="badge danger" style={{ marginLeft: '4px' }}>{myPendingShipments.length}</span>}
                </div>
                <div className={`pill ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                    <ShoppingCart size={14} style={{ marginRight: '6px' }} /> Future Orders ({myFutureOrders.length})
                </div>
                <div className={`pill ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                    <History size={14} style={{ marginRight: '6px' }} /> Completed Records
                </div>
            </div>

            <div style={{ marginTop: '24px' }}>
                {activeTab === 'inventory' && (
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <div className="header-flex" style={{ marginBottom: '20px' }}>
                            <h3>Branch Inventory</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn" onClick={() => setShowWarehouseOrderModal(true)}><Truck size={16} /> Order Stock</button>
                                <button className="btn secondary" onClick={() => setShowRequestModal(true)}><PlusCircle size={16} /> Propose Item</button>
                            </div>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Alerts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => {
                                    const inv = storeInventory.find(i => i.itemId === item.id);
                                    const qty = inv ? inv.stock : 0;
                                    return (
                                        <tr key={item.id}>
                                            <td>{item.name} {item.image}</td>
                                            <td>{item.category}</td>
                                            <td style={{ fontWeight: 'bold' }}>{qty}</td>
                                            <td>{qty <= 5 ? <span className="badge danger">Auto-Order Required</span> : <span className="badge success">Stock Healthy</span>}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'shipments' && (
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3>Logistics & Request Log</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Verify arrivals to update store availability.</p>

                        <h4 style={{ marginBottom: '12px', color: 'var(--primary)' }}>Outgoing Warehouse Orders</h4>
                        <table style={{ marginBottom: '24px' }}>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Requested</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myWhRequests.map(r => (
                                    <tr key={r.id}>
                                        <td>{items.find(i => i.id === r.itemId)?.name}</td>
                                        <td>{r.qty}</td>
                                        <td>
                                            <span className={`badge ${r.status === 'processed' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}`}>
                                                {r.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h4 style={{ marginBottom: '12px', color: 'var(--success)' }}>Incoming Shipments</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Sent</th>
                                    <th>Status</th>
                                    <th>Verify</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingShipments.filter(s => s.storeId === user.storeId).map(s => (
                                    <tr key={s.id}>
                                        <td>{items.find(i => i.id === s.itemId)?.name}</td>
                                        <td>{s.qty}</td>
                                        <td><span className="badge warning">{s.status.toUpperCase()}</span></td>
                                        <td>
                                            {s.status === 'shipped' && <button className="btn" style={{ padding: '4px 12px' }} onClick={() => onVerifyShipment(s.id)}>Unload & Count</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3>Upcoming Collections (Future Orders)</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Note</th>
                                    <th>Total Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myFutureOrders.map(o => (
                                    <tr key={o.id}>
                                        <td style={{ fontWeight: 'bold' }}>{o.customerName}</td>
                                        <td>{o.customerPhone}</td>
                                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.notes || 'No notes'}</td>
                                        <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Rs.{(o.total - o.deposit).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        {!isHistoryUnlocked ? (
                            <div style={{ textAlign: 'center', padding: '60px' }}>
                                <Lock size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
                                <h3>Secure Operations Audit</h3>
                                <form onSubmit={handleUnlockHistory} style={{ maxWidth: '300px', margin: '0 auto', display: 'flex', gap: '8px' }}>
                                    <input type="password" placeholder="Branch PIN" value={historyPassword} onChange={e => setHistoryPassword(e.target.value)} />
                                    <button type="submit" className="btn">Unlock</button>
                                </form>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <h4 style={{ marginBottom: '16px' }}>Completed Future Orders</h4>
                                    <table>
                                        <thead>
                                            <tr><th>Customer</th><th>Paid</th></tr>
                                        </thead>
                                        <tbody>
                                            {completedFutureOrders.map(o => (
                                                <tr key={o.id}><td>{o.customerName}</td><td>Rs.{o.total.toLocaleString()}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '16px' }}>Standard Sale Logs</h4>
                                    <table>
                                        <thead><tr><th>Time</th><th>Amount</th></tr></thead>
                                        <tbody>
                                            {storeSales.map(s => (
                                                <tr key={s.id}><td>{new Date(s.timestamp).toLocaleTimeString()}</td><td>Rs.{s.total.toLocaleString()}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showWarehouseOrderModal && (
                <div className="glass-panel modal" style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    zIndex: 100, padding: '32px', width: '400px', background: 'var(--bg-color)',
                    border: '2px solid var(--primary)'
                }}>
                    <h3>Request Warehouse Reorder</h3>
                    <form onSubmit={handleWhOrder} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        <select required value={whOrder.itemId} onChange={e => setWhOrder({ ...whOrder, itemId: e.target.value })}>
                            <option value="">Select Item...</option>
                            {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                        <input type="number" placeholder="Critical Qty" required value={whOrder.qty} onChange={e => setWhOrder({ ...whOrder, qty: e.target.value })} />
                        <button type="submit" className="btn">Send Official Order</button>
                        <button type="button" className="btn secondary" onClick={() => setShowWarehouseOrderModal(false)}>Cancel</button>
                    </form>
                </div>
            )}

            {showRequestModal && (
                <div className="glass-panel modal" style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    zIndex: 100, padding: '32px', width: '400px', background: 'var(--bg-color)',
                    border: '2px solid var(--primary)'
                }}>
                    <h3>New Product Proposal</h3>
                    <form onSubmit={handleSendRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        <input type="text" placeholder="Item Name" required value={requestItem.name} onChange={e => setRequestItem({ ...requestItem, name: e.target.value })} />
                        <input type="number" placeholder="Proposed Selling Price" required value={requestItem.price} onChange={e => setRequestItem({ ...requestItem, price: e.target.value })} />
                        <button type="submit" className="btn">Send to Owner</button>
                        <button type="button" className="btn secondary" onClick={() => setShowRequestModal(false)}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default OutletManager;
