'use client';

import { useState } from 'react';

interface Reservation {
    id: string;
    customerName: string;
    partySize: number;
    date: string;
    time: string;
    table: string;
    status: 'confirmed' | 'seated' | 'cancelled' | 'pending';
    notes?: string;
}

const initialReservations: Reservation[] = [
    { id: 'RES-001', customerName: 'John Smith', partySize: 4, date: '2023-10-27', time: '19:00', table: 'Table 5', status: 'confirmed', notes: 'Anniversary' },
    { id: 'RES-002', customerName: 'Sarah Connor', partySize: 2, date: '2023-10-27', time: '19:30', table: 'Table 2', status: 'confirmed' },
    { id: 'RES-003', customerName: 'Mike Ross', partySize: 6, date: '2023-10-27', time: '20:00', table: 'Table 8', status: 'pending' },
    { id: 'RES-004', customerName: 'Emily Blunt', partySize: 3, date: '2023-10-27', time: '18:00', table: 'Table 3', status: 'seated' },
    { id: 'RES-005', customerName: 'Tom Hardy', partySize: 2, date: '2023-10-28', time: '19:00', table: 'Unassigned', status: 'cancelled' },
];

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>(initialReservations);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-atlassian-neutral-800">Reservations</h1>
                    <p className="text-atlassian-neutral-500 text-sm">Manage table bookings and guest lists.</p>
                </div>
                <button className="btn-primary flex items-center gap-2 bg-atlassian-blue-600 text-white px-4 py-2 rounded hover:bg-atlassian-blue-700 transition-colors text-sm font-medium">
                    <span>📅</span> New Reservation
                </button>
            </div>

            {/* Date Picker / Timeline (Mock) */}
            <div className="bg-white p-4 rounded-lg border border-atlassian-neutral-300 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button className="p-1 hover:bg-atlassian-neutral-100 rounded">◀️</button>
                    <span className="font-bold text-atlassian-neutral-800">October 27, 2023</span>
                    <button className="p-1 hover:bg-atlassian-neutral-100 rounded">▶️</button>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-atlassian-blue-50 text-atlassian-blue-700 rounded text-sm font-medium">Day</button>
                    <button className="px-3 py-1 hover:bg-atlassian-neutral-100 text-atlassian-neutral-600 rounded text-sm font-medium">Week</button>
                    <button className="px-3 py-1 hover:bg-atlassian-neutral-100 text-atlassian-neutral-600 rounded text-sm font-medium">Month</button>
                </div>
            </div>

            {/* Reservations List */}
            <div className="bg-white rounded-lg border border-atlassian-neutral-300 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-atlassian-neutral-200 bg-atlassian-neutral-50">
                    <h3 className="font-semibold text-atlassian-neutral-700">Upcoming Bookings</h3>
                </div>
                <div className="divide-y divide-atlassian-neutral-200">
                    {reservations.map((res) => (
                        <div key={res.id} className="p-4 flex items-center justify-between hover:bg-atlassian-neutral-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-atlassian-blue-100 flex flex-col items-center justify-center text-atlassian-blue-700">
                                    <span className="text-xs font-bold">{res.time}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-atlassian-neutral-800">{res.customerName}</h4>
                                    <div className="flex items-center gap-3 text-sm text-atlassian-neutral-500">
                                        <span className="flex items-center gap-1">👥 {res.partySize} Guests</span>
                                        <span className="flex items-center gap-1">🍽️ {res.table}</span>
                                    </div>
                                    {res.notes && (
                                        <p className="text-xs text-atlassian-blue-600 mt-1">📝 {res.notes}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                  ${res.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                  ${res.status === 'seated' ? 'bg-blue-100 text-blue-800' : ''}
                  ${res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${res.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                `}>
                                    {res.status}
                                </span>
                                <button className="p-2 hover:bg-atlassian-neutral-200 rounded-full text-atlassian-neutral-400 hover:text-atlassian-neutral-600">
                                    ⋮
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
