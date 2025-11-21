'use client';

import { useState } from 'react';

interface StaffMember {
    id: string;
    name: string;
    role: string;
    status: 'on_shift' | 'off_shift' | 'on_break';
    shiftStart: string;
    shiftEnd: string;
    avatar: string;
}

const initialStaff: StaffMember[] = [
    { id: 'STF-001', name: 'Olivia Chen', role: 'Server', status: 'on_shift', shiftStart: '10:00 AM', shiftEnd: '04:00 PM', avatar: '👩‍💼' },
    { id: 'STF-002', name: 'Ben Miller', role: 'Head Chef', status: 'on_shift', shiftStart: '12:00 PM', shiftEnd: '09:00 PM', avatar: '👨‍🍳' },
    { id: 'STF-003', name: 'Liam Wilson', role: 'Barista', status: 'on_break', shiftStart: '08:00 AM', shiftEnd: '02:00 PM', avatar: '☕' },
    { id: 'STF-004', name: 'Emma Davis', role: 'Host', status: 'off_shift', shiftStart: '04:00 PM', shiftEnd: '10:00 PM', avatar: '📋' },
    { id: 'STF-005', name: 'Noah Brown', role: 'Sous Chef', status: 'off_shift', shiftStart: '02:00 PM', shiftEnd: '10:00 PM', avatar: '🔪' },
];

export default function StaffPage() {
    const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-atlassian-neutral-800">Staff Management</h1>
                    <p className="text-atlassian-neutral-500 text-sm">Manage schedules, roles, and employee details.</p>
                </div>
                <button className="btn-primary flex items-center gap-2 bg-atlassian-blue-600 text-white px-4 py-2 rounded hover:bg-atlassian-blue-700 transition-colors text-sm font-medium">
                    <span>👤</span> Add Employee
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* On Shift Now */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg border border-atlassian-neutral-300 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-atlassian-neutral-200 flex justify-between items-center bg-atlassian-neutral-50">
                            <h3 className="font-semibold text-atlassian-neutral-700">Current Shift Status</h3>
                            <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                {staffList.filter(s => s.status === 'on_shift').length} Active
                            </span>
                        </div>
                        <div className="divide-y divide-atlassian-neutral-200">
                            {staffList.map((staff) => (
                                <div key={staff.id} className="p-4 flex items-center justify-between hover:bg-atlassian-neutral-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-atlassian-neutral-100 flex items-center justify-center text-xl border border-atlassian-neutral-200">
                                            {staff.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-atlassian-neutral-800">{staff.name}</h4>
                                            <p className="text-sm text-atlassian-neutral-500">{staff.role}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs text-atlassian-neutral-400 uppercase font-semibold">Schedule</p>
                                            <p className="text-sm text-atlassian-neutral-700 font-medium">{staff.shiftStart} - {staff.shiftEnd}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide w-24 text-center
                      ${staff.status === 'on_shift' ? 'bg-green-100 text-green-700' : ''}
                      ${staff.status === 'on_break' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${staff.status === 'off_shift' ? 'bg-gray-100 text-gray-500' : ''}
                    `}>
                                            {staff.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Stats / Notices */}
                <div className="space-y-6">
                    <div className="bg-atlassian-blue-50 rounded-lg border border-atlassian-blue-200 p-6">
                        <h3 className="font-bold text-atlassian-blue-800 mb-2">📢 Team Announcements</h3>
                        <p className="text-sm text-atlassian-blue-900 mb-4">
                            Staff meeting this Friday at 9:00 AM to discuss the new fall menu launch.
                        </p>
                        <button className="text-xs font-bold text-atlassian-blue-700 hover:text-atlassian-blue-800 uppercase tracking-wide">
                            View All Notices →
                        </button>
                    </div>

                    <div className="bg-white rounded-lg border border-atlassian-neutral-300 shadow-sm p-6">
                        <h3 className="font-bold text-atlassian-neutral-800 mb-4">Performance This Week</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-atlassian-neutral-600">Hours Worked</span>
                                    <span className="font-bold text-atlassian-neutral-800">142 / 160</span>
                                </div>
                                <div className="w-full bg-atlassian-neutral-200 rounded-full h-2">
                                    <div className="bg-atlassian-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-atlassian-neutral-600">Tips Collected</span>
                                    <span className="font-bold text-atlassian-neutral-800">$850.00</span>
                                </div>
                                <div className="w-full bg-atlassian-neutral-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
