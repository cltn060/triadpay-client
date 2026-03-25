import { useTranslations } from "next-intl";
import {
    TopNav,
    StatsCards,
    TransactionsTable,
    InventoryPanel,
    VolumeChart,
    PspWarning,
} from "@/components/dashboard";

export default function SellerOverviewPage() {
    const t = useTranslations("SellerOverview");

    return (
        <>
            <TopNav title={t("title")} />
            <div className="p-8 relative z-0 space-y-8 w-full">
                <PspWarning type="seller" />
                <StatsCards />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <TransactionsTable />
                    <InventoryPanel />
                </div>
                <VolumeChart />
            </div>
        </>
    );
}
