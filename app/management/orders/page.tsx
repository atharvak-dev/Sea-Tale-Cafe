'use client';

import { useState } from 'react';

type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed';

interface Order {
    id: string;
    table: string;
    items: string[];
    status: OrderStatus;
    time: string;
    total: string;
}

const initialOrders: Order[] = [
    { id: 'ORD-001', table: 'Table 4', items: ['Seafood Paella', 'Iced Latte'], status: 'new', time: '10:45 AM', total: '$45.00' },
    { id: 'ORD-002', table: 'Table 2', items: ['Fish & Chips'], status: 'new', time: '10:48 AM', total: '$18.00' },
    { id: 'ORD-003', table: 'Table 7', items: ['Clam Chowder', 'Garlic Bread'], status: 'preparing', time: '10:30 AM', total: '$22.50' },
    { id: 'ORD-004', table: 'Table 1', items: ['Grilled Salmon', 'White Wine'], status: 'preparing', time: '10:35 AM', total: '$38.00' },
    { id: 'ORD-005', table: 'Table 5', items: ['Calamari Rings'], status: 'ready', time: '10:20 AM', total: '$15.00' },
    { id: 'ORD-006', table: 'Table 9', items: ['Espresso', 'Cheesecake'], status: 'completed', time: '09:50 AM', total: '$12.00' },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>(initialOrders);

    const columns: { id: OrderStatus; label: string; color: string }[] = [
        { id: 'new', label: 'New Orders', color: 'bg-atlassian-blue-50 border-atlassian-blue-200' },
        { id: 'preparing', label: 'In Kitchen', color: 'bg-atlassian-yellow-50 border-atlassian-yellow-200' },
        { id: 'ready', label: 'Ready to Serve', color: 'bg-atlassian-green-50 border-atlassian-green-200' },
        { id: 'completed', label: 'Completed', color: 'bg-atlassian-neutral-200 border-atlassian-neutral-300' },
    ];

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-atlassian-neutral-800">Orders Board</h1>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-atlassian-neutral-100 text-atlassian-neutral-700 rounded hover:bg-atlassian-neutral-200 font-medium text-sm transition-colors">
                        Filter
                    </button>
                    <button className="px-4 py-2 bg-atlassian-blue-600 text-white rounded hover:bg-atlassian-blue-700 font-medium text-sm transition-colors shadow-sm">
                        Create Order
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-6 min-w-[1000px] h-full pb-4">
                    {columns.map((column) => (
                        <div key={column.id} className={`flex-1 min-w-[280px] flex flex-col rounded-lg bg-atlassian-neutral-100/50 border border-atlassian-neutral-300/50`}>
                            {/* Column Header */}
                            <div className={`p-3 border-b border-atlassian-neutral-200 rounded-t-lg flex items-center justify-between ${column.color} bg-opacity-40`}>
                                <h2 className="font-semibold text-sm text-atlassian-neutral-700 uppercase tracking-wide">
                                    {column.label}
                                </h2>
                                <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold text-atlassian-neutral-600">
                                    {orders.filter(o => o.status === column.id).length}
                                </span>
                            </div>

                            {/* Column Content */}
                            <div className="p-2 flex-1 overflow-y-auto space-y-3">
                                {orders
                                    .filter((order) => order.status === column.id)
                                    .map((order) => (
                                        <div
                                            key={order.id}
                                            className="bg-white p-4 rounded border border-atlassian-neutral-300 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-atlassian-neutral-800">{order.table}</span>
                                                <span className="text-xs text-atlassian-neutral-500 font-mono">{order.id}</span>
                                            </div>

                                            <ul className="text-sm text-atlassian-neutral-600 mb-3 space-y-1">
                                                {order.items.map((item, idx) => (
                                                    <li key={idx} className="flex items-center gap-2">
                                                        <span className="w-1 h-1 rounded-full bg-atlassian-neutral-400"></span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="flex items-center justify-between pt-2 border-t border-atlassian-neutral-100 mt-2">
                                                <span className="text-xs text-atlassian-neutral-400 flex items-center gap-1">
                                                    🕒 {order.time}
                                                </span>
                                                <span className="font-semibold text-sm text-atlassian-neutral-700">{order.total}</span>
                                            </div>

                                            {/* Nautical Accent */}
                                            <div className="absolute -right-2 -bottom-2 opacity-5 text-4xl transform rotate-12 group-hover:opacity-10 transition-opacity">
                                                {column.id === 'new' ? '📝' :
                                                    column.id === 'preparing' ? '🍳' :
                                                        column.id === 'ready' ? '🔔' : '✅'}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
