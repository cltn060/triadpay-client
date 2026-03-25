"use client";

import { useTranslations } from "next-intl";
import {
    TopNav,
    PayoutsStatsCards,
    PayoutsHistoryTable,
} from "@/components/dashboard";

export default function PayoutsPage() {
    const t = useTranslations("SellerPayouts");

    return (
        <>
            <TopNav title={t("title")} />
            <div className="flex-1 overflow-y-auto relative z-0 p-8 pt-6 space-y-8 w-full">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        {t("overview")}
                    </h2>
                    <p className="text-text-grey mt-1">
                        {t("manageNote")}
                    </p>
                </div>

                <PayoutsStatsCards />
                <PayoutsHistoryTable />
            </div>
        </>
    );
}
