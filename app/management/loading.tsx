export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 border-4 border-atlassian-neutral-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-atlassian-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">
                    🐙
                </div>
            </div>
            <h2 className="text-atlassian-neutral-600 font-medium animate-pulse">Loading Sea Tale Manager...</h2>
        </div>
    );
}
