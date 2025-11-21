import Sidebar from '@/components/management/Sidebar';
import TopNav from '@/components/management/TopNav';

export default function ManagementLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-atlassian-neutral-100 font-inter text-atlassian-neutral-800">
            <Sidebar />
            <TopNav />
            <main className="ml-64 p-8 min-h-[calc(100vh-4rem)]">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
