export default function TopNav() {
    return (
        <header className="h-16 bg-white border-b border-atlassian-neutral-300 flex items-center justify-between px-6 sticky top-0 z-40 ml-64 shadow-sm">
            {/* Breadcrumbs / Context */}
            <div className="flex items-center gap-2 text-sm text-atlassian-neutral-500">
                <span className="hover:text-atlassian-blue-600 cursor-pointer transition-colors">Sea Tale</span>
                <span>/</span>
                <span className="font-medium text-atlassian-neutral-800">Dashboard</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-4 py-1.5 bg-atlassian-neutral-100 border border-atlassian-neutral-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-atlassian-blue-400 focus:border-transparent w-64 transition-all"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-atlassian-neutral-500 text-xs">
                        🔍
                    </span>
                </div>

                <button className="p-2 hover:bg-atlassian-neutral-200 rounded-full transition-colors relative">
                    <span className="text-lg">🔔</span>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-atlassian-red rounded-full border border-white"></span>
                </button>

                <button className="p-2 hover:bg-atlassian-neutral-200 rounded-full transition-colors">
                    <span className="text-lg">⚙️</span>
                </button>
            </div>
        </header>
    );
}
