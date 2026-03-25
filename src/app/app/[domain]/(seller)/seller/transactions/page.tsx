"use client";

import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../../../../../convex/_generated/api";
import {
    TopNav,
    TransactionsStatsCards,
    TransactionsLedgerTable,
} from "@/components/dashboard";

export default function TransactionsPage() {
    const t = useTranslations("SellerTransactions");
    const data = useQuery(api.transactions.getSellerTransactions);

    return (
        <div className="flex flex-col h-full bg-[#050505] overflow-y-auto custom-scrollbar">
            <TopNav title={t("title")} />
            <div className="p-8 relative z-0 space-y-6 w-full">
                {data === undefined ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <span className="material-icons text-4xl text-white/10 animate-spin">sync</span>
                        <span className="text-gray-500 text-sm font-medium">{t("loading")}</span>
                    </div>
                ) : (
                    <>
                        <TransactionsStatsCards stats={{ ...data.stats, awaitingSettlementCents: 0 }} />
                        <TransactionsLedgerTable transactions={data.transactions} />
                    </>
                )}
            </div>
        </div>
    );
}
