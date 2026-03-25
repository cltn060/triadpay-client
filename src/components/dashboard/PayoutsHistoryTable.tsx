"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type PayoutStatus = "FROZEN" | "Completed" | "Processing";

interface Payout {
    refId: string;
    dateMain: string;
    dateSub: string;
    destIcon: string;
    destIconBg: string;
    destIconColor: string;
    destIconBorder: string;
    destName: string;
    destDetail: string;
    amount: string;
    status: PayoutStatus;
    frozen?: boolean;
}

export function PayoutsHistoryTable() {
    const t = useTranslations("PayoutsHistoryTable");

    const payouts: Payout[] = [
        {
            refId: "#TX-9928-AB",
            dateMain: t("today"),
            dateSub: "10:42 AM",
            destIcon: "account_balance",
            destIconBg: "bg-blue-500/10",
            destIconColor: "text-blue-400",
            destIconBorder: "border-blue-500/20",
            destName: "Chase Bank",
            destDetail: "**** 4421",
            amount: "$4,500.00",
            status: "FROZEN",
            frozen: true,
        },
        {
            refId: "#TX-8821-ZZ",
            dateMain: t("yesterday"),
            dateSub: "04:15 PM",
            destIcon: "currency_bitcoin",
            destIconBg: "bg-purple-500/10",
            destIconColor: "text-purple-400",
            destIconBorder: "border-purple-500/20",
            destName: "ETH Wallet",
            destDetail: "0x4...8a2",
            amount: "$12,000.00",
            status: "Completed",
        },
        {
            refId: "#TX-8800-CA",
            dateMain: "Oct 24, 2023",
            dateSub: "09:30 AM",
            destIcon: "account_balance",
            destIconBg: "bg-blue-500/10",
            destIconColor: "text-blue-400",
            destIconBorder: "border-blue-500/20",
            destName: "Chase Bank",
            destDetail: "**** 4421",
            amount: "$850.00",
            status: "Processing",
        },
        {
            refId: "#TX-7742-XY",
            dateMain: "Oct 23, 2023",
            dateSub: "02:12 PM",
            destIcon: "public",
            destIconBg: "bg-indigo-500/10",
            destIconColor: "text-indigo-400",
            destIconBorder: "border-indigo-500/20",
            destName: "Wire Transfer",
            destDetail: "SWIFT: HABC...",
            amount: "$25,000.00",
            status: "FROZEN",
            frozen: true,
        },
    ];

    const statusBadge: Record<PayoutStatus, string> = {
        FROZEN: "bg-yellow-500 text-black font-bold border-yellow-400/50 shadow-[0_0_15px_rgba(255,215,0,0.2)]",
        Completed: "bg-primary/10 text-primary font-medium border-primary/20",
        Processing: "bg-white/5 text-slate-300 font-medium border-white/10",
    };

    return (
        <section className="bg-surface-dark border border-white/5 rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                    {t("title")}
                </h3>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-xs uppercase tracking-wider text-text-grey font-semibold border-b border-white/5">
                            <th className="px-6 py-4">{t("colReferenceId")}</th>
                            <th className="px-6 py-4">{t("colDateTime")}</th>
                            <th className="px-6 py-4">{t("colDestination")}</th>
                            <th className="px-6 py-4 text-right">{t("colAmount")}</th>
                            <th className="px-6 py-4 text-center">{t("colStatus")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                        {payouts.map((p) => (
                            <tr
                                key={p.refId}
                                className="group hover:bg-white/5 transition-colors relative"
                            >
                                {/* Frozen indicator bar */}
                                {p.frozen && (
                                    <td className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
                                )}

                                <td className="px-6 py-4 font-mono text-text-grey">
                                    {p.refId}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-white font-medium">
                                        {p.dateMain}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {p.dateSub}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn("w-8 h-8 rounded-full flex items-center justify-center border", p.destIconBg, p.destIconColor, p.destIconBorder)}
                                        >
                                            <span className="material-icons text-sm">
                                                {p.destIcon}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">
                                                {p.destName}
                                            </div>
                                            <div className="text-xs text-slate-500 font-mono">
                                                {p.destDetail}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-white">
                                    {p.amount}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span
                                        className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border uppercase tracking-widest font-bold", statusBadge[p.status])}
                                    >
                                        {p.status === "FROZEN" && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-black" />
                                        )}
                                        {p.status === "Completed" && (
                                            <span className="material-icons text-[12px]">
                                                check
                                            </span>
                                        )}
                                        {p.status === "Processing" && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                                        )}
                                        {t(`status.${p.status}`)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-sm text-text-grey">
                    {t("showingDetails", { start: 1, end: 4, total: 124 })}
                </span>
                <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-medium text-text-grey bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer active:scale-95">
                        {t("previous")}
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer active:scale-95">
                        {t("next")}
                    </button>
                </div>
            </div>
        </section>
    );
}
