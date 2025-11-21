'use client';

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-atlassian-neutral-800">Reports & Analytics</h1>
                    <p className="text-atlassian-neutral-500 text-sm">Insights into your restaurant's performance.</p>
                </div>
                <div className="flex gap-2">
                    <select className="bg-white border border-atlassian-neutral-300 text-atlassian-neutral-700 text-sm rounded px-3 py-2 focus:outline-none focus:border-atlassian-blue-500">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Month</option>
                        <option>This Year</option>
                    </select>
                    <button className="btn-primary bg-atlassian-blue-600 text-white px-4 py-2 rounded hover:bg-atlassian-blue-700 transition-colors text-sm font-medium">
                        Download Report
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: '$12,450', change: '+12%', color: 'text-green-600' },
                    { label: 'Total Orders', value: '452', change: '+5%', color: 'text-blue-600' },
                    { label: 'Avg. Order Value', value: '$27.50', change: '+2%', color: 'text-purple-600' },
                    { label: 'Customer Satisfaction', value: '4.8/5', change: '0%', color: 'text-yellow-600' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-lg border border-atlassian-neutral-300 shadow-sm">
                        <p className="text-xs font-bold text-atlassian-neutral-500 uppercase tracking-wide mb-2">{stat.label}</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-bold text-atlassian-neutral-800">{stat.value}</h3>
                            <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-atlassian-neutral-500'} mb-1`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-atlassian-neutral-300 shadow-sm min-h-[300px] flex flex-col">
                    <h3 className="font-bold text-atlassian-neutral-800 mb-4">Revenue Over Time</h3>
                    <div className="flex-1 flex items-end justify-between gap-2 px-4 pb-4 border-b border-atlassian-neutral-200">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full bg-atlassian-blue-100 hover:bg-atlassian-blue-200 transition-colors rounded-t relative group" style={{ height: `${h}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-atlassian-neutral-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    ${h * 100}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-atlassian-neutral-500 mt-2 px-4">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-atlassian-neutral-300 shadow-sm min-h-[300px]">
                    <h3 className="font-bold text-atlassian-neutral-800 mb-4">Top Selling Categories</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Mains', val: 45, color: 'bg-blue-500' },
                            { name: 'Beverages', val: 25, color: 'bg-green-500' },
                            { name: 'Starters', val: 15, color: 'bg-yellow-500' },
                            { name: 'Desserts', val: 10, color: 'bg-purple-500' },
                            { name: 'Others', val: 5, color: 'bg-gray-400' },
                        ].map((cat) => (
                            <div key={cat.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-atlassian-neutral-700 font-medium">{cat.name}</span>
                                    <span className="text-atlassian-neutral-500">{cat.val}%</span>
                                </div>
                                <div className="w-full bg-atlassian-neutral-100 rounded-full h-2.5 overflow-hidden">
                                    <div className={`h-full ${cat.color}`} style={{ width: `${cat.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
