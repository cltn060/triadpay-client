export function DashboardSkeleton() {
    return (
        <div className="bg-background-dark text-text-grey font-sans antialiased h-screen w-full flex overflow-hidden">
            {/* Sidebar Skeleton */}
            <aside className="w-64 h-full flex flex-col justify-between border-r border-white/5 bg-background-dark relative z-20">
                <div className="p-6">
                    {/* Logo & Store Name */}
                    <div className="flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse flex-shrink-0" />
                        <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
                    </div>

                    {/* Nav Items */}
                    <div className="space-y-2">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <div className="w-5 h-5 rounded bg-white/10 animate-pulse flex-shrink-0" />
                                <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Profile Widget */}
                <div className="p-4 mx-2 mb-2 bg-surface-dark rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                        <div className="h-2 w-24 bg-white/10 rounded animate-pulse" />
                    </div>
                    <div className="w-5 h-5 rounded bg-white/10 animate-pulse flex-shrink-0" />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full relative overflow-y-auto bg-background-dark p-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
                        <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-64 bg-white/10 rounded animate-pulse" />
                        <div className="h-10 w-10 bg-white/10 rounded-full animate-pulse flex-shrink-0" />
                    </div>
                </div>

                {/* Content Cards Skeleton Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-surface-dark border border-white/5 rounded-2xl p-6 h-32 flex flex-col justify-between">
                            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                            <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                    <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 h-full flex flex-col">
                        <div className="h-6 w-40 bg-white/10 rounded animate-pulse mb-6" />
                        <div className="flex-1 bg-white/5 rounded-xl animate-pulse" />
                    </div>
                    <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 h-full flex flex-col">
                        <div className="h-6 w-32 bg-white/10 rounded animate-pulse mb-6" />
                        <div className="flex-1 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
