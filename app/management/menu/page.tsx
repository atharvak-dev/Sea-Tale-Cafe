'use client';

import { useState } from 'react';

interface MenuItem {
    id: string;
    name: string;
    category: string;
    price: number;
    status: 'active' | 'out_of_stock' | 'archived';
    description: string;
}

const initialItems: MenuItem[] = [
    { id: 'MNU-001', name: 'Seafood Paella', category: 'Mains', price: 24.50, status: 'active', description: 'Traditional Spanish rice dish with fresh seafood.' },
    { id: 'MNU-002', name: 'Clam Chowder', category: 'Starters', price: 12.00, status: 'active', description: 'Creamy soup with fresh clams and potatoes.' },
    { id: 'MNU-003', name: 'Grilled Salmon', category: 'Mains', price: 28.00, status: 'active', description: 'Fresh Atlantic salmon with asparagus.' },
    { id: 'MNU-004', name: 'Iced Latte', category: 'Beverages', price: 5.50, status: 'active', description: 'Espresso with cold milk and ice.' },
    { id: 'MNU-005', name: 'Lobster Roll', category: 'Specials', price: 32.00, status: 'out_of_stock', description: 'Fresh lobster meat in a toasted bun.' },
    { id: 'MNU-006', name: 'Tiramisu', category: 'Desserts', price: 9.00, status: 'active', description: 'Classic Italian coffee-flavored dessert.' },
];

export default function MenuPage() {
    const [items, setItems] = useState<MenuItem[]>(initialItems);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const categories = ['All', 'Starters', 'Mains', 'Beverages', 'Desserts', 'Specials'];

    const filteredItems = selectedCategory === 'All'
        ? items
        : items.filter(item => item.category === selectedCategory);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-atlassian-neutral-800">Menu Management</h1>
                    <p className="text-atlassian-neutral-500 text-sm">Manage your dishes, prices, and availability.</p>
                </div>
                <button className="btn-primary flex items-center gap-2 bg-atlassian-blue-600 text-white px-4 py-2 rounded hover:bg-atlassian-blue-700 transition-colors">
                    <span>➕</span> Add New Item
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 border-b border-atlassian-neutral-300 pb-1">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors relative top-[1px] border-b-2 ${selectedCategory === category
                                ? 'text-atlassian-blue-600 border-atlassian-blue-600 bg-atlassian-blue-50'
                                : 'text-atlassian-neutral-600 border-transparent hover:bg-atlassian-neutral-100'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-atlassian-neutral-300 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-atlassian-neutral-100 border-b border-atlassian-neutral-300">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-atlassian-neutral-700">Name</th>
                            <th className="px-6 py-3 font-semibold text-atlassian-neutral-700">Category</th>
                            <th className="px-6 py-3 font-semibold text-atlassian-neutral-700">Price</th>
                            <th className="px-6 py-3 font-semibold text-atlassian-neutral-700">Status</th>
                            <th className="px-6 py-3 font-semibold text-atlassian-neutral-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-atlassian-neutral-200">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-atlassian-neutral-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-atlassian-neutral-800">{item.name}</div>
                                    <div className="text-xs text-atlassian-neutral-500 truncate max-w-[200px]">{item.description}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-atlassian-neutral-100 text-atlassian-neutral-800">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-atlassian-neutral-600">
                                    ${item.price.toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${item.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    ${item.status === 'out_of_stock' ? 'bg-red-100 text-red-800' : ''}
                    ${item.status === 'archived' ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                                        <span className={`w-1.5 h-1.5 rounded-full 
                      ${item.status === 'active' ? 'bg-green-600' : ''}
                      ${item.status === 'out_of_stock' ? 'bg-red-600' : ''}
                      ${item.status === 'archived' ? 'bg-gray-600' : ''}
                    `}></span>
                                        {item.status === 'active' ? 'Active' : item.status === 'out_of_stock' ? 'Out of Stock' : 'Archived'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 hover:bg-atlassian-neutral-200 rounded text-atlassian-neutral-600" title="Edit">
                                            ✏️
                                        </button>
                                        <button className="p-1 hover:bg-red-100 rounded text-red-600" title="Delete">
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredItems.length === 0 && (
                    <div className="p-8 text-center text-atlassian-neutral-500">
                        No items found in this category.
                    </div>
                )}
            </div>
        </div>
    );
}
