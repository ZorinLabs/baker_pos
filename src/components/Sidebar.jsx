import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, LogOut, Store, Truck } from 'lucide-react';
import { stores } from '../mockData';

const Sidebar = ({ currentView, setCurrentView, user, onLogout }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <Store />
                <span>Bakery POS</span>
            </div>

            <div style={{ flex: 1 }}>
                {user.role === 'admin' ? (
                    <>
                        <div
                            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setCurrentView('dashboard')}
                        >
                            <LayoutDashboard size={20} />
                            Dashboard
                        </div>
                        <div
                            className={`nav-item ${currentView === 'inventory' ? 'active' : ''}`}
                            onClick={() => setCurrentView('inventory')}
                        >
                            <Package size={20} />
                            Inventory Management
                        </div>
                    </>
                ) : user.role === 'warehouse' ? (
                    <div
                        className={`nav-item ${currentView === 'warehouse' ? 'active' : ''}`}
                        onClick={() => setCurrentView('warehouse')}
                    >
                        <Truck size={20} />
                        Warehouse Dispatch
                    </div>
                ) : (
                    <div
                        className={`nav-item ${currentView === 'pos' ? 'active' : ''}`}
                        onClick={() => setCurrentView('pos')}
                    >
                        <ShoppingCart size={20} />
                        Point of Sale
                    </div>
                )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                <div style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Logged in as <b>{user.name}</b><br />
                    {user.role === 'cashier' ? `Store: ${stores.find(s => s.id === user.storeId)?.name}` : user.role === 'warehouse' ? 'Main Warehouse' : 'Owner'}
                </div>
                <div className="nav-item" onClick={onLogout} style={{ color: 'var(--danger)' }}>
                    <LogOut size={20} />
                    Logout
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
