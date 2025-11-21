import DashboardWidget from '@/components/management/DashboardWidget';

export default function ManagementDashboard() {
    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold text-atlassian-neutral-800 mb-2">Welcome, Manager! 👋</h1>
                <p className="text-atlassian-neutral-500">Here's what's happening at Sea Tale Café today.</p>
            </div>

            {/* Key Metrics Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardWidget
                    title="Today's Sales"
                    value="$1,250"
                    trend="15% from yesterday"
                    trendUp={true}
                    icon="💰"
                    color="gold"
                />
                <DashboardWidget
                    title="Upcoming Reservations"
                    value="5 tables"
                    trend="Next: 2:30 PM - J. Smith"
                    trendUp={true}
                    icon="📅"
                    color="green"
                />
                <DashboardWidget
                    title="Low Stock Items"
                    value="2 items"
                    trend="Milk (5 gal), Coffee Beans"
                    trendUp={false}
                    icon="⚠️"
                    color="coral"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Live Orders Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-atlassian-neutral-800">Live Orders Feed</h2>
                        <button className="text-atlassian-blue-600 hover:text-atlassian-blue-700 text-sm font-medium">View All</button>
                    </div>

                    <div className="bg-white rounded-lg border border-atlassian-neutral-300 shadow-sm overflow-hidden">
                        {[
                            { id: 1, table: 'Table 7', items: '2 Lattes, 1 Muffin', time: '10:26 AM', status: 'Ready', statusColor: 'green' },
                            { id: 2, table: 'Table 3', items: 'Fish & Chips, Iced Tea', time: '10:21 AM', status: 'Preparing', statusColor: 'blue' },
                            { id: 3, table: 'Table 5', items: 'Seafood Pasta', time: '10:15 AM', status: 'Pending', statusColor: 'yellow' },
                        ].map((order, index) => (
                            <div key={order.id} className={`p-4 flex items-center justify-between ${index !== 2 ? 'border-b border-atlassian-neutral-200' : ''} hover:bg-atlassian-neutral-50 transition-colors`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-ocean-50 flex items-center justify-center text-ocean-600">
                                        {order.items.includes('Latte') ? '☕' : '🍽️'}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-atlassian-neutral-800">{order.table}</h3>
                                        <p className="text-sm text-atlassian-neutral-500">{order.items}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-1
                    ${order.status === 'Ready' ? 'bg-green-100 text-green-700' : ''}
                    ${order.status === 'Preparing' ? 'bg-blue-100 text-blue-700' : ''}
                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                  `}>
                                        {order.status}
                                    </span>
                                    <p className="text-xs text-atlassian-neutral-400">{order.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Staff Schedule */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-atlassian-neutral-800">Staff Schedule</h2>
                        <button className="text-atlassian-blue-600 hover:text-atlassian-blue-700 text-sm font-medium">Edit</button>
                    </div>

                    <div className="bg-white rounded-lg border border-atlassian-neutral-300 shadow-sm p-4 space-y-4">
                        {[
                            { name: 'Olivia', role: 'Server', time: '10:00 AM - 4:00 PM', avatar: '👩‍💼' },
                            { name: 'Ben', role: 'Chef', time: '12:00 PM - 8:00 PM', avatar: '👨‍🍳' },
                            { name: 'Liam', role: 'Barista', time: '08:00 AM - 2:00 PM', avatar: '☕' },
                        ].map((staff) => (
                            <div key={staff.name} className="flex items-center gap-3 pb-3 border-b border-atlassian-neutral-100 last:border-0 last:pb-0">
                                <div className="w-8 h-8 rounded-full bg-atlassian-neutral-100 flex items-center justify-center text-lg">
                                    {staff.avatar}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm text-atlassian-neutral-800">{staff.name}</h4>
                                    <p className="text-xs text-atlassian-neutral-500">{staff.role}</p>
                                </div>
                                <div className="text-xs font-medium text-atlassian-neutral-600 bg-atlassian-neutral-100 px-2 py-1 rounded">
                                    {staff.time}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions Card */}
                    <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 rounded-lg shadow-md p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full text-left px-3 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors text-sm flex items-center gap-2">
                                    <span>➕</span> New Reservation
                                </button>
                                <button className="w-full text-left px-3 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors text-sm flex items-center gap-2">
                                    <span>📦</span> Order Supplies
                                </button>
                            </div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 text-8xl opacity-10 rotate-12">
                            ⚓
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
