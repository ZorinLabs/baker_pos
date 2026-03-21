import React, { useState } from 'react';
import { stores } from '../mockData';
import { Package } from 'lucide-react';

const Inventory = ({ inventory, items, onUpdateStock }) => {
    const [selectedStore, setSelectedStore] = useState('1');
    const [search, setSearch] = useState('');

    const storeInventory = inventory.filter(inv => inv.storeId === parseInt(selectedStore));

    const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

    const handleStockChange = (itemId, val) => {
        let num = parseInt(val, 10);
        if (isNaN(num)) num = 0;
        onUpdateStock(parseInt(selectedStore), itemId, num);
    };

    return (
        <div>
            <div className="header-flex">
                <div>
                    <h1 className="page-title text-gradient">Inventory Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage stock across branches</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '250px' }}
                    />
                    <select
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        style={{ width: '200px' }}
                    >
                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="glass-panel table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Current Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => {
                            const invData = storeInventory.find(i => i.itemId === item.id);
                            const stock = invData ? invData.stock : 0;
                            const threshold = invData ? invData.lowStockThreshold : 5;
                            const isLow = stock <= threshold;

                            return (
                                <tr key={item.id}>
                                    <td style={{ fontSize: '24px' }}>{item.image}</td>
                                    <td style={{ fontWeight: '500' }}>{item.name}</td>
                                    <td>
                                        <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td>
                                        {isLow ? (
                                            <span className="badge danger">Low Stock</span>
                                        ) : (
                                            <span className="badge success">Healthy</span>
                                        )}
                                    </td>
                                    <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="number"
                                            value={stock}
                                            onChange={(e) => handleStockChange(item.id, e.target.value)}
                                            style={{ width: '100px', background: 'rgba(0,0,0,0.2)' }}
                                        />
                                        <Package size={18} color="var(--text-muted)" />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
