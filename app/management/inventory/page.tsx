'use client';

import { useState } from 'react';

interface InventoryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    threshold: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    lastUpdated: string;
}

const initialInventory: InventoryItem[] = [
    { id: 'INV-001', name: 'Coffee Beans (Arabica)', category: 'Beverages', quantity: 15, unit: 'kg', threshold: 5, status: 'in_stock', lastUpdated: '2023-10-25' },
    { id: 'INV-002', name: 'Whole Milk', category: 'Dairy', quantity: 2, unit: 'gallons', threshold: 5, status: 'low_stock', lastUpdated: '2023-10-26' },
    { id: 'INV-003', name: 'Salmon Fillets', category: 'Seafood', quantity: 8, unit: 'kg', threshold: 3, status: 'in_stock', lastUpdated: '2023-10-26' },
    { id: 'INV-004', name: 'Sourdough Bread', category: 'Bakery', quantity: 0, unit: 'loaves', threshold: 4, status: 'out_of_stock', lastUpdated: '2023-10-25' },
    { id: 'INV-005', name: 'Olive Oil', category: 'Pantry', quantity: 12, unit: 'liters', threshold: 2, status: 'in_stock', lastUpdated: '2023-10-20' },
    { id: 'INV-006', name: 'Napkins', category: 'Supplies', quantity: 500, unit: 'packs', threshold: 100, status: 'in_stock', lastUpdated: '2023-10-22' },
];

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>(initialInventory);
    const [filter, setFilter] = useState<string>('all');

    const filteredItems = filter === 'all'
        ? items
        : items.filter(item => item.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-atlassian-neutral-800">Inventory</h1>
                    <p className="text-atlassian-neutral-500 text-sm">Track stock levels and manage supplies.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary px-4 py-2 border border-atlassian-neutral-300 rounded text-atlassian-neutral-700 hover:bg-atlassian-neutral-100 transition-colors text-sm font-medium">
                        Export CSV
                    </button>
                    <button className="btn-primary flex items-center gap-2 bg-atlassian-blue-600 text-white px-4 py-2 rounded hover:bg-atlassian-blue-700 transition-colors text-sm font-medium">
                        <span>📦</span> Add Stock
                    </button>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-atlassian-neutral-300 shadow-sm">
                    <div className="text-atlassian-neutral-500 text-xs uppercase font-bold mb-1">Total Items</div>
                    <div className="text-2xl font-bold text-atlassian-neutral-800">{items.length}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 shadow-sm">
                    <div className="text-red-600 text-xs uppercase font-bold mb-1">Low / Out of Stock</div>
                    <div className="text-2xl font-bold text-red-700">
                        {items.filter(i => i.status !== 'in_stock').length}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-atlassian-neutral-300 shadow-sm">
                    <div className="text-atlassian-neutral-500 text-xs uppercase font-bold mb-1">Total Value</div>
                    <div className="text-2xl font-bold text-atlassian-neutral-800">$4,250</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                {['all', 'in_stock', 'low_stock', 'out_of_stock'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize
              ${filter === status
                                ? 'bg-atlassian-blue-100 text-atlassian-blue-700'
                                : 'bg-atlassian-neutral-100 text-atlassian-neutral-600 hover:bg-atlassian-neutral-200'
                            }`}
                    >
                        {status.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-atlassian-neutral-300 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-atlassian-neutral-100 border-b border-atlassian-neutral-300">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-atlassian-neutral-700">Item Name</th>
                            <th className="px-6 py-3 font-semibold text-atlassian-neutral-700">Category</th>
                            <th className="px-6 py-3 font-semibold text-atlassian-neutral-700">Stock Level</th>
                            <th className="px-6 py-3 font-semibold text-atlassian-neutral-700">Status</th>
                            <th className="px-6 py-3 font-semibold text-atlassian-neutral-700">Last Updated</th>
                            <th className="px-6 py-3 font-semibold text-atlassian-neutral-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-atlassian-neutral-200">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-atlassian-neutral-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-atlassian-neutral-800">{item.name}</div>
                                    <div className="text-xs text-atlassian-neutral-500 font-mono">{item.id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-atlassian-neutral-100 text-atlassian-neutral-600">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-atlassian-neutral-800">{item.quantity}</span>
                                        <span className="text-atlassian-neutral-500 text-xs">{item.unit}</span>
                                    </div>
                                    {/* Progress bar for stock level (mock) */}
                                    <div className="w-24 h-1.5 bg-atlassian-neutral-200 rounded-full mt-1 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${item.status === 'in_stock' ? 'bg-green-500' :
                                                    item.status === 'low_stock' ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: item.status === 'out_of_stock' ? '0%' : item.status === 'low_stock' ? '20%' : '75%' }}
                                        ></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${item.status === 'in_stock' ? 'bg-green-100 text-green-800' : ''}
                    ${item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${item.status === 'out_of_stock' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                                        {item.status === 'in_stock' && '✅ In Stock'}
                                        {item.status === 'low_stock' && '⚠️ Low Stock'}
                                        {item.status === 'out_of_stock' && '❌ Out of Stock'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-atlassian-neutral-600">
                                    {item.lastUpdated}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-atlassian-blue-600 hover:text-atlassian-blue-800 font-medium text-xs">
                                        Update
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
