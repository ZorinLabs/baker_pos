export const stores = [
    { id: 1, name: 'Colombo Main Bakery', location: 'Colombo' },
    { id: 2, name: 'Kandy Outlet', location: 'Kandy' }
];

export const users = [
    { id: 1, username: 'admin', password: '123', role: 'admin', name: 'Store Owner' },
    { id: 2, username: 'cashier1', password: '123', role: 'cashier', name: 'Nimal', storeId: 1 },
    { id: 3, username: 'cashier2', password: '123', role: 'cashier', name: 'Kamal', storeId: 2 },
    { id: 4, username: 'warehouse', password: '123', role: 'warehouse', name: 'Saman' },
    { id: 5, username: 'mgr1', password: '123', role: 'manager', name: 'Sunil', storeId: 1 },
    { id: 6, username: 'mgr2', password: '123', role: 'manager', name: 'Anura', storeId: 2 }
];

export const initialPendingItems = [];
export const initialPendingShipments = []; // { id, itemId, storeId, qty, status: 'pending'|'shipped'|'delivered', warehouseAction: 'approved'|'rejected', managerAction: 'verified' }
export const initialFutureOrders = []; // { id, storeId, customerName, customerPhone, notes, items, total, deposit, status: 'pending'|'completed' }
export const initialStoreRequests = []; // { id, storeId, itemId, qty, status: 'pending'|'processed'|'rejected' }

export const items = [
    // Bakery Items
    { id: 'b1', name: 'Chocolate Cake', category: 'Bakery', cost: 800, price: 1500, image: '🎂' },
    { id: 'b2', name: 'Butter Croissant', category: 'Bakery', cost: 150, price: 350, image: '🥐' },
    { id: 'b3', name: 'Chicken Pastry', category: 'Bakery', cost: 80, price: 180, image: '🥟' },
    { id: 'b4', name: 'Fish Bun', category: 'Bakery', cost: 50, price: 120, image: '🐟' },
    { id: 'b5', name: 'Sausage Bun', category: 'Bakery', cost: 60, price: 150, image: '🌭' },
    { id: 'b6', name: 'Roast Bread', category: 'Bakery', cost: 70, price: 140, image: '🍞' },
    { id: 'b7', name: 'Kimbula Bun', category: 'Bakery', cost: 40, price: 90, image: '🥐' },
    { id: 'b8', name: 'Muffins', category: 'Bakery', cost: 100, price: 250, image: '🧁' },

    // Distributed Items
    { id: 'd1', name: 'Coca Cola 500ml', category: 'Distributed', cost: 120, price: 180, image: '🥤' },
    { id: 'd2', name: 'Sprite 500ml', category: 'Distributed', cost: 120, price: 180, image: '🥤' },
    { id: 'd3', name: 'Potato Chips', category: 'Distributed', cost: 200, price: 300, image: '🥔' },
    { id: 'd4', name: 'Marie Biscuits', category: 'Distributed', cost: 80, price: 100, image: '🍪' },
    { id: 'd5', name: 'Lemon Puff', category: 'Distributed', cost: 150, price: 200, image: '🍪' },
    { id: 'd6', name: 'Chocolate Milk', category: 'Distributed', cost: 180, price: 250, image: '🧃' }
];

export const initialInventory = [
    // Store 1 (Colombo)
    { storeId: 1, itemId: 'b1', stock: 10, lowStockThreshold: 5 },
    { storeId: 1, itemId: 'b2', stock: 40, lowStockThreshold: 20 },
    { storeId: 1, itemId: 'b3', stock: 50, lowStockThreshold: 15 },
    { storeId: 1, itemId: 'b4', stock: 60, lowStockThreshold: 15 },
    { storeId: 1, itemId: 'b5', stock: 30, lowStockThreshold: 15 },
    { storeId: 1, itemId: 'b6', stock: 25, lowStockThreshold: 10 },
    { storeId: 1, itemId: 'b7', stock: 45, lowStockThreshold: 20 },
    { storeId: 1, itemId: 'b8', stock: 15, lowStockThreshold: 10 },
    { storeId: 1, itemId: 'd1', stock: 100, lowStockThreshold: 30 },
    { storeId: 1, itemId: 'd2', stock: 100, lowStockThreshold: 30 },
    { storeId: 1, itemId: 'd3', stock: 50, lowStockThreshold: 20 },
    { storeId: 1, itemId: 'd4', stock: 80, lowStockThreshold: 25 },
    { storeId: 1, itemId: 'd5', stock: 60, lowStockThreshold: 20 },
    { storeId: 1, itemId: 'd6', stock: 40, lowStockThreshold: 15 },

    // Store 2 (Kandy)
    { storeId: 2, itemId: 'b1', stock: 5, lowStockThreshold: 3 },
    { storeId: 2, itemId: 'b2', stock: 20, lowStockThreshold: 10 },
    { storeId: 2, itemId: 'b3', stock: 30, lowStockThreshold: 15 },
    { storeId: 2, itemId: 'b4', stock: 40, lowStockThreshold: 20 },
    { storeId: 2, itemId: 'b5', stock: 25, lowStockThreshold: 10 },
    { storeId: 2, itemId: 'b6', stock: 15, lowStockThreshold: 10 },
    { storeId: 2, itemId: 'b7', stock: 35, lowStockThreshold: 15 },
    { storeId: 2, itemId: 'b8', stock: 8, lowStockThreshold: 5 },
    { storeId: 2, itemId: 'd1', stock: 80, lowStockThreshold: 25 },
    { storeId: 2, itemId: 'd2', stock: 75, lowStockThreshold: 25 },
    { storeId: 2, itemId: 'd3', stock: 40, lowStockThreshold: 15 },
    { storeId: 2, itemId: 'd4', stock: 60, lowStockThreshold: 20 },
    { storeId: 2, itemId: 'd5', stock: 45, lowStockThreshold: 15 },
    { storeId: 2, itemId: 'd6', stock: 25, lowStockThreshold: 10 },
];

export const generateMockSales = () => {
    const sales = [];
    const storesArr = [1, 2];

    // Generate random past sales for charts
    const days = 7;
    const now = new Date();

    for (let d = days; d >= 0; d--) {
        const date = new Date();
        date.setDate(now.getDate() - d);

        storesArr.forEach(storeId => {
            // 5-15 sales per day per store
            const numSales = Math.floor(Math.random() * 10) + 5;
            for (let s = 0; s < numSales; s++) {
                const numItems = Math.floor(Math.random() * 3) + 1;
                const saleItems = [];
                let total = 0;

                for (let i = 0; i < numItems; i++) {
                    const randomItem = items[Math.floor(Math.random() * items.length)];
                    const qty = Math.floor(Math.random() * 3) + 1;
                    saleItems.push({ item: randomItem, qty, targetPrice: randomItem.price });
                    total += randomItem.price * qty;
                }

                sales.push({
                    id: Math.random().toString(36).substr(2, 9),
                    storeId,
                    items: saleItems,
                    total,
                    timestamp: new Date(date).toISOString()
                });
            }
        });
    }

    return sales;
};

export const initialSales = generateMockSales();
