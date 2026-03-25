"use client";

const categories = [
    { label: "Electronics", count: 42, checked: true },
    { label: "Clothing", count: 18, checked: true },
    { label: "Digital Assets", count: 156, checked: false },
    { label: "Services", count: 8, checked: false },
];

const stockStatuses = [
    { label: "In Stock", color: "bg-primary", percent: "w-[80%]" },
    { label: "Low Stock", color: "bg-yellow-500", percent: "w-[15%]" },
    { label: "Out of Stock", color: "bg-red-500", percent: "w-[5%]" },
];

export function ProductsSidebar() {
    return (
        <div className="w-72 border-l border-white/5 bg-surface-dark hidden 2xl:flex flex-col p-6 space-y-8">
            {/* Categories */}
            <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                    Categories
                </h3>
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <label
                            key={cat.label}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                        >
                            <div className="relative flex items-center">
                                <input
                                    defaultChecked={cat.checked}
                                    className="peer h-4 w-4 rounded border-white/20 bg-background-dark text-primary focus:ring-primary/20 focus:ring-offset-0 transition-all checked:bg-primary checked:border-primary"
                                    type="checkbox"
                                />
                            </div>
                            <span className="text-sm text-text-grey group-hover:text-white transition-colors">
                                {cat.label}
                            </span>
                            <span className="ml-auto text-xs text-text-grey font-mono">
                                {cat.count}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Stock Status */}
            <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                    Stock Status
                </h3>
                <div className="space-y-3">
                    {stockStatuses.map((s) => (
                        <div
                            key={s.label}
                            className="flex items-center justify-between text-sm"
                        >
                            <span className="text-text-grey">{s.label}</span>
                            <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`${s.color} h-full rounded-full ${s.percent}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Help Card */}
            <div className="mt-auto p-4 bg-white/5 rounded-xl border border-white/5">
                <h4 className="text-white font-bold mb-2">Need help?</h4>
                <p className="text-xs text-text-grey mb-3">
                    Check our documentation for bulk product imports and API
                    integrations.
                </p>
                <button className="text-xs text-primary hover:text-white transition-colors font-medium flex items-center gap-1 cursor-pointer">
                    View Documentation
                    <span className="material-icons text-[12px]">
                        arrow_forward
                    </span>
                </button>
            </div>
        </div>
    );
}
