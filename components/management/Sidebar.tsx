import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    { name: 'Dashboard', href: '/management', icon: '⚓' },
    { name: 'Orders', href: '/management/orders', icon: '📋' },
    { name: 'Menu Management', href: '/management/menu', icon: '🍽️' },
    { name: 'Staff', href: '/management/staff', icon: '👥' },
    { name: 'Inventory', href: '/management/inventory', icon: '📦' },
    { name: 'Reservations', href: '/management/reservations', icon: '📅' },
    { name: 'Reports', href: '/management/reports', icon: '📊' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 h-screen bg-atlassian-neutral-800 text-atlassian-neutral-400 flex flex-col fixed left-0 top-0 z-50 border-r border-atlassian-neutral-500 shadow-xl">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3 border-b border-atlassian-neutral-500/30">
                <div className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-ocean-700 rounded-lg flex items-center justify-center text-white text-xl shadow-lg">
                    🐙
                </div>
                <div>
                    <h1 className="text-white font-bold text-lg tracking-wide">Sea Tale</h1>
                    <p className="text-xs text-atlassian-neutral-500 uppercase tracking-wider">Management</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group
                ${isActive
                                    ? 'bg-atlassian-blue-700 text-white shadow-md'
                                    : 'hover:bg-atlassian-neutral-700 hover:text-atlassian-neutral-100'
                                }
              `}
                        >
                            <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {item.icon}
                            </span>
                            <span className="font-medium text-sm">{item.name}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sea-gold animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Footer */}
            <div className="p-4 border-t border-atlassian-neutral-500/30 bg-atlassian-neutral-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sea-gold flex items-center justify-center text-atlassian-neutral-900 font-bold text-xs">
                        MG
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">Manager</p>
                        <p className="text-xs text-atlassian-neutral-500 truncate">Sea Tale Café</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
