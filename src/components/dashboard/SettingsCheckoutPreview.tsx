import Image from "next/image";

export function SettingsCheckoutPreview() {
    return (
        <div className="lg:col-span-5 lg:sticky lg:top-24">
            {/* Label */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                    Live Preview
                </span>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs text-primary font-medium">
                        Updating Live
                    </span>
                </div>
            </div>

            {/* Preview Card */}
            <div className="relative group">
                {/* Glow Border */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />

                <div className="relative bg-surface-dark/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 md:p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10">
                                <span className="font-bold italic text-white">
                                    A
                                </span>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">
                                    Acme Corp
                                </h3>
                                <p className="text-xs text-gray-400">
                                    secure checkout
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">Total Due</p>
                            <p className="text-xl font-bold text-white">
                                $99.00
                            </p>
                        </div>
                    </div>

                    {/* Product */}
                    <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden relative flex-shrink-0">
                                <Image
                                    alt="Pro Plan"
                                    className="object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQPSjZa0pYsohKjf3vHIj7Ydx0W36N8c4gv203Z73k3PaQe8OqdrGpyt2WLuxkneizeAZsgfdyx9R5Pv2qfITA1F1v7UrxDLsH2k3-0TkR3wtnahTYS1UtIk-KEzPt0Vo5ReOhJtMfeCzpVQacJTB3OOLNrJ95qclDlYnAz5zQvuwykljgEwCFLAi6ZcGycMewSP2FNU9wFIWpQ-1NIG5DG_wSszjLqK6ULMaa6vGa7szMF5tjmVSWMG2k8XtxR3-BFpfGeo_FwPk"
                                    fill
                                    sizes="48px"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">
                                    Pro Plan - Yearly
                                </p>
                                <p className="text-xs text-gray-400">
                                    Billed annually
                                </p>
                            </div>
                            <p className="text-sm font-medium text-white">
                                $99.00
                            </p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-gray-500 font-bold">
                                Email Address
                            </label>
                            <input
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
                                placeholder="john@example.com"
                                readOnly
                                type="email"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase text-gray-500 font-bold">
                                Card Details
                            </label>
                            <div className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
                                <span className="material-icons text-white/50 text-sm">
                                    credit_card
                                </span>
                                <input
                                    className="bg-transparent border-none p-0 text-sm w-full text-white placeholder-gray-600 focus:ring-0 focus:outline-none"
                                    placeholder="0000 0000 0000 0000"
                                    readOnly
                                    type="text"
                                />
                                <div className="flex gap-2">
                                    <input
                                        className="bg-transparent border-none p-0 text-sm w-12 text-white placeholder-gray-600 focus:ring-0 focus:outline-none text-center"
                                        placeholder="MM/YY"
                                        readOnly
                                        type="text"
                                    />
                                    <input
                                        className="bg-transparent border-none p-0 text-sm w-8 text-white placeholder-gray-600 focus:ring-0 focus:outline-none text-center"
                                        placeholder="CVC"
                                        readOnly
                                        type="text"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <button className="w-full bg-primary text-black font-bold py-3 rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow mt-4 text-sm flex items-center justify-center gap-2 cursor-pointer">
                            <span className="material-icons text-sm">
                                lock
                            </span>
                            Pay $99.00
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center flex flex-col items-center gap-2">
                        <div className="flex gap-3 opacity-50">
                            <div className="w-8 h-5 bg-white/10 rounded" />
                            <div className="w-8 h-5 bg-white/10 rounded" />
                            <div className="w-8 h-5 bg-white/10 rounded" />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                            <span className="material-icons text-[10px]">
                                bolt
                            </span>
                            Powered by{" "}
                            <span className="text-gray-300 font-semibold">
                                Triadpay
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
