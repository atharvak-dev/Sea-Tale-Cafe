interface DashboardWidgetProps {
    title: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon: string;
    color?: 'blue' | 'green' | 'gold' | 'coral';
}

export default function DashboardWidget({ title, value, trend, trendUp, icon, color = 'blue' }: DashboardWidgetProps) {
    const colorClasses = {
        blue: 'bg-atlassian-blue-50 text-atlassian-blue-700 border-atlassian-blue-200',
        green: 'bg-green-50 text-atlassian-green border-green-200',
        gold: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        coral: 'bg-coral-50 text-coral-600 border-coral-200',
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-atlassian-neutral-300 shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-300`}>
                <span className="text-6xl">{icon}</span>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-md ${colorClasses[color]} border`}>
                        <span className="text-xl">{icon}</span>
                    </div>
                    <h3 className="text-sm font-medium text-atlassian-neutral-500 uppercase tracking-wide">{title}</h3>
                </div>

                <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold text-atlassian-neutral-800 font-display">{value}</span>
                    {trend && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full mb-1 ${trendUp
                                ? 'bg-green-100 text-atlassian-green'
                                : 'bg-red-100 text-atlassian-red'
                            }`}>
                            {trendUp ? '↑' : '↓'} {trend}
                        </span>
                    )}
                </div>
            </div>

            {/* Nautical decoration */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-atlassian-neutral-300 to-transparent opacity-30"></div>
        </div>
    );
}
