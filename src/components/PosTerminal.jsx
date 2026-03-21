import React, { useState, useMemo } from 'react';
import { stores } from '../mockData';
import { ShoppingBag, Minus, Plus, Trash2, CheckCircle2, Calendar, User, Phone, StickyNote } from 'lucide-react';

const PosTerminal = ({ user, inventory, items, futureOrders, onAddSale, onRequestProduct, onPlaceFutureOrder, onCompleteFutureOrder }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeTab, setActiveTab] = useState('sales'); // sales | future
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');

    const [showFutureModal, setShowFutureModal] = useState(false);
    const [futureOrderData, setFutureOrderData] = useState({ customerName: '', customerPhone: '', deposit: '', notes: '' });

    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestItem, setRequestItem] = useState({ name: '', category: 'Bakery', price: '', cost: '', image: '📦' });

    const storeInventory = useMemo(() => {
        return inventory.filter(inv => inv.storeId === user.storeId);
    }, [inventory, user.storeId]);

    const categories = ['All', ...new Set(items.map(i => i.category))];

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchCat = activeCategory === 'All' || item.category === activeCategory;
            const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
            return matchCat && matchSearch;
        });
    }, [activeCategory, search, items]);

    const addToCart = (item) => {
        const invItem = storeInventory.find(inv => inv.itemId === item.id);
        const availableStock = invItem ? invItem.stock : 0;

        setCart(prev => {
            const existing = prev.find(p => p.item.id === item.id);
            if (existing) {
                if (existing.qty >= availableStock) {
                    alert(`Not enough stock. Only ${availableStock} left in inventory!`);
                    return prev;
                }
                return prev.map(p => p.item.id === item.id ? { ...p, qty: p.qty + 1 } : p);
            } else {
                if (availableStock <= 0) {
                    alert(`Out of stock!`);
                    return prev;
                }
                return [...prev, { item, qty: 1 }];
            }
        });
    };

    const updateCartQty = (item, delta) => {
        const invItem = storeInventory.find(inv => inv.itemId === item.id);
        const availableStock = invItem ? invItem.stock : 0;

        setCart(prev => {
            return prev.map(p => {
                if (p.item.id === item.id) {
                    const newQty = p.qty + delta;
                    if (newQty > availableStock) {
                        alert(`Not enough stock. Only ${availableStock} left!`);
                        return p;
                    }
                    return { ...p, qty: Math.max(1, newQty) };
                }
                return p;
            });
        });
    };

    const removeFromCart = (item) => {
        setCart(prev => prev.filter(p => p.item.id !== item.id));
    };

    const total = cart.reduce((sum, cartItem) => sum + (cartItem.item.price * cartItem.qty), 0);

    const handleSendRequest = (e) => {
        e.preventDefault();
        if (!requestItem.name || !requestItem.price) return;
        onRequestProduct({ ...requestItem, price: Number(requestItem.price), cost: Number(requestItem.cost) });
        setRequestItem({ name: '', category: 'Bakery', price: '', cost: '', image: '📦' });
        setShowRequestModal(false);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        onAddSale(user.storeId, cart, total);
        setCart([]);
        alert('Sale completed successfully!');
    };

    return (
        <div className="pos-layout">
            {/* Products Area */}
            <div className="products-area">
                <div className="header-flex">
                    <div>
                        <h1 className="page-title">Point of Sale</h1>
                        <p style={{ color: 'var(--text-muted)' }}>{stores.find(s => s.id === user.storeId)?.name}</p>
                    </div>
                    <div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {onRequestProduct && (
                                <button className="btn secondary" onClick={() => setShowRequestModal(true)}>
                                    <Plus size={16} /> Request New Item
                                </button>
                            )}
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ width: '250px' }}
                            />
                        </div>
                    </div>
                </div>

                {showRequestModal && (
                    <div className="glass-panel" style={{
                        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        zIndex: 100, padding: '32px', width: '400px', background: 'var(--bg-color)',
                        border: '2px solid var(--primary)'
                    }}>
                        <h3>Request New Item Approval</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Owner must approve this before it appears for sale.
                        </p>
                        <form onSubmit={handleSendRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input type="text" placeholder="Item Name" required value={requestItem.name} onChange={e => setRequestItem({ ...requestItem, name: e.target.value })} />
                            <select value={requestItem.category} onChange={e => setRequestItem({ ...requestItem, category: e.target.value })}>
                                <option>Bakery</option>
                                <option>Distributed</option>
                            </select>
                            <input type="number" placeholder="Selling Price (Rs)" required value={requestItem.price} onChange={e => setRequestItem({ ...requestItem, price: e.target.value })} />
                            <input type="number" placeholder="Cost Price (Rs)" value={requestItem.cost} onChange={e => setRequestItem({ ...requestItem, cost: e.target.value })} />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="submit" className="btn" style={{ flex: 1 }}>Submit Request</button>
                                <button type="button" className="btn secondary" onClick={() => setShowRequestModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {showFutureModal && (
                    <div className="glass-panel" style={{
                        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        zIndex: 100, padding: '32px', width: '450px', background: 'var(--bg-color)',
                        border: '2px solid var(--primary)'
                    }}>
                        <h3>Place Future Order</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>Global Due Amount: Rs.{total.toLocaleString()}</p>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            onPlaceFutureOrder({ ...futureOrderData, items: cart, total, deposit: Number(futureOrderData.deposit), storeId: user.storeId });
                            setCart([]);
                            setShowFutureModal(false);
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="input-with-icon">
                                <User size={16} />
                                <input type="text" placeholder="Customer Full Name" required value={futureOrderData.customerName} onChange={e => setFutureOrderData({ ...futureOrderData, customerName: e.target.value })} />
                            </div>
                            <div className="input-with-icon">
                                <Phone size={16} />
                                <input type="text" placeholder="Phone Number (e.g. 07XXXXXXXX)" required value={futureOrderData.customerPhone} onChange={e => setFutureOrderData({ ...futureOrderData, customerPhone: e.target.value })} />
                            </div>
                            <div className="input-with-icon">
                                <Banknote size={16} />
                                <input type="number" placeholder="Deposit Collected (Rs)" required value={futureOrderData.deposit} onChange={e => setFutureOrderData({ ...futureOrderData, deposit: e.target.value })} />
                            </div>
                            <div className="input-with-icon" style={{ alignItems: 'flex-start' }}>
                                <StickyNote size={16} style={{ marginTop: '12px' }} />
                                <textarea
                                    placeholder="Special Notes (e.g. Birthday wish, no nuts)"
                                    rows="3"
                                    value={futureOrderData.notes}
                                    onChange={e => setFutureOrderData({ ...futureOrderData, notes: e.target.value })}
                                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '8px', width: '100%', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                <button type="submit" className="btn" style={{ flex: 1 }}>Log Order & Deposit</button>
                                <button type="button" className="btn secondary" onClick={() => setShowFutureModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="category-pills">
                    <div className={`pill ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>Shop Store</div>
                    <div className={`pill ${activeTab === 'future' ? 'active' : ''}`} onClick={() => setActiveTab('future')}>
                        <Calendar size={14} style={{ marginRight: '6px' }} /> Open Customer Orders
                    </div>
                </div>

                {activeTab === 'sales' && (
                    <div className="category-pills">
                        {categories.map(cat => (
                            <div
                                key={cat}
                                className={`pill ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </div>
                        ))}
                    </div>
                )}

                <div className="products-grid">
                    {activeTab === 'sales' ? (
                        filteredItems.map(item => {
                            const stockLevel = storeInventory.find(i => i.itemId === item.id)?.stock || 0;
                            const isLowStock = stockLevel <= 5;
                            return (
                                <div key={item.id} className="product-card glass-panel" onClick={() => addToCart(item)}>
                                    <div className="product-image">{item.image}</div>
                                    <div className="product-name">{item.name}</div>
                                    <div className="product-price">Rs.{item.price}</div>
                                    <div style={{ fontSize: '12px', color: isLowStock ? 'var(--danger)' : 'var(--text-muted)' }}>
                                        Stock: {stockLevel}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ gridColumn: '1 / -1' }} className="glass-panel table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Phone</th>
                                        <th>Pending Bal.</th>
                                        <th>Items</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {futureOrders.filter(o => o.storeId === user.storeId && o.status === 'pending').map(order => (
                                        <tr key={order.id}>
                                            <td>
                                                <div style={{ fontWeight: 'bold' }}>{order.customerName}</div>
                                                {order.notes && <div style={{ fontSize: '10px', color: 'var(--warning)' }}>Note: {order.notes}</div>}
                                            </td>
                                            <td>{order.customerPhone}</td>
                                            <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Rs.{(order.total - order.deposit).toLocaleString()}</td>
                                            <td style={{ fontSize: '12px' }}>{order.items.map(i => `${i.qty}x ${i.item.name}`).join(', ')}</td>
                                            <td>
                                                <button className="btn" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => onCompleteFutureOrder(order.id)}>
                                                    Verify & Collect
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {futureOrders.filter(o => o.storeId === user.storeId && o.status === 'pending').length === 0 && (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending future orders</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="cart-sidebar glass-panel">
                <div className="cart-header">Current Order</div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                            <ShoppingBag size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                            Cart is empty
                        </div>
                    ) : (
                        cart.map(c => (
                            <div key={c.item.id} className="cart-item">
                                <div className="cart-item-info">
                                    <span className="cart-item-title">{c.item.name}</span>
                                    <span className="cart-item-price">Rs.{c.item.price} x {c.qty}</span>
                                </div>
                                <div className="qty-controls">
                                    <button className="qty-btn" onClick={() => updateCartQty(c.item, -1)}><Minus size={14} /></button>
                                    <span style={{ minWidth: '20px', textAlign: 'center' }}>{c.qty}</span>
                                    <button className="qty-btn" onClick={() => updateCartQty(c.item, 1)}><Plus size={14} /></button>
                                    <button className="qty-btn" style={{ background: 'transparent', color: 'var(--danger)' }} onClick={() => removeFromCart(c.item)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-footer">
                    <div className="cart-total-row">
                        <span>Subtotal</span>
                        <span>Rs.{total.toFixed(2)}</span>
                    </div>
                    <div className="cart-total-row grand-total">
                        <span>Total</span>
                        <span className="text-gradient">Rs.{total.toFixed(2)}</span>
                    </div>

                    <button
                        className="btn checkout-btn"
                        disabled={cart.length === 0}
                        onClick={handleCheckout}
                    >
                        <CheckCircle2 size={20} />
                        Immediate Checkout
                    </button>

                    <button
                        className="btn secondary checkout-btn"
                        style={{ marginTop: '-8px' }}
                        disabled={cart.length === 0}
                        onClick={() => setShowFutureModal(true)}
                    >
                        <Calendar size={18} />
                        Place Future Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PosTerminal;
