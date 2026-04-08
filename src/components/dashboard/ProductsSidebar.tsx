"use client";

const categories = [
    { label: "Electronics", count: 42, checked: true },
    { label: "Clothing", count: 18, checked: true },
    { label: "Digital Assets", count: 156, checked: false },
    { label: "Services", count: 8, checked: false },
];

const stockStatuses = [
    { label: "In Stock", color: "bg-primary", percent: "w-[72%]" },
    { label: "Low Stock", color: "bg-amber-400", percent: "w-[18%]" },
    { label: "Out of Stock", color: "bg-red-500", percent: "w-[10%]" },
];

export function ProductsSidebar() {
    return (
        <aside className="hidden w-80 flex-col gap-8 border-l border-white/10 bg-[#0d1117]/95 p-6 xl:flex">
            <div className="space-y-4 rounded-3xl border border-white/10 bg-[#111827]/80 p-5 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Categories</h3>
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <label
                            key={cat.label}
                            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition hover:border-primary"
                        >
                            <input
                                defaultChecked={cat.checked}
                                className="h-4 w-4 rounded border-white/20 bg-[#0a0a0a] text-primary focus:ring-primary/20"
                                type="checkbox"
                            />
                            <span className="text-sm text-white">{cat.label}</span>
                            <span className="ml-auto rounded-full bg-white/5 px-2 py-1 text-[11px] uppercase tracking-[0.25em] text-text-grey">
                                {cat.count}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-white/10 bg-[#111827]/80 p-5 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Stock Status</h3>
                <div className="space-y-4">
                    {stockStatuses.map((status) => (
                        <div key={status.label} className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-text-grey">
                                <span>{status.label}</span>
                                <span>{status.percent.replace("w-[", "").replace("%]", "%")}</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                                <div className={`${status.color} h-full rounded-full ${status.percent}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto rounded-3xl border border-white/10 bg-[#111827]/80 p-6 shadow-sm">
                <h4 className="text-base font-semibold text-white">Need help?</h4>
                <p className="mt-2 text-sm text-text-grey">
                    Browse our docs for faster bulk updates, import templates, and onboarding checklists.
                </p>
                <button className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10">
                    View Documentation
                    <span className="material-icons text-base">arrow_forward</span>
                </button>
            </div>
        </aside>
    );
}
