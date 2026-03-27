"use client";

import { useQuery, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../../../convex/_generated/api";
import { formatMoney } from "@/lib/currency";
import { useState } from "react";

function formatCents(cents: number): string {
    return formatMoney(cents, "USD");
}

const STATUS_STYLES: Record<string, string> = {
    PAID: "text-green-400 bg-green-400/10 border-green-400/20",
    PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    IN_PROCESS: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    FAILED: "text-red-400 bg-red-400/10 border-red-400/20",
    REFUNDED: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    AUTHORIZED: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    SETTLED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

function SkeletonRow({ cols }: { cols: number }) {
    return (
        <tr className="border-b border-white/5">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-4">
                    <div
                        className="animate-pulse bg-white/5 rounded h-4"
                        style={{ width: `${60 + (i * 15) % 40}%` }}
                    />
                </td>
            ))}
        </tr>
    );
}

function StatCard({
    label,
    value,
    subValue,
    icon,
    valueColor,
}: {
    label: string;
    value: string | number;
    subValue?: string;
    icon: string;
    valueColor?: string;
}) {
    return (
        <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-icons text-text-grey text-[20px]">{icon}</span>
                <p className="text-text-grey text-xs uppercase tracking-widest font-semibold">{label}</p>
            </div>
            <p className="text-3xl font-bold" style={{ color: valueColor || "white" }}>
                {value}
            </p>
            {subValue && <p className="text-text-grey text-sm mt-1">{subValue}</p>}
        </div>
    );
}

interface PaginationProps {
    page: number;
    setPage: (page: number) => void;
    totalItems: number;
    perPage: number;
}

function PaginationControl({ page, setPage, totalItems, perPage }: PaginationProps) {
    const startIdx = page * perPage + 1;
    const endIdx = Math.min((page + 1) * perPage, totalItems);
    const hasNext = endIdx < totalItems;

    return (
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/5">
            <span className="text-text-grey text-xs">
                Showing {startIdx}–{endIdx} of {totalItems}
            </span>
            <div className="flex gap-2">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-text-grey hover:text-white disabled:opacity-50 cursor-pointer transition-colors"
                >
                    Prev
                </button>
                <button
                    disabled={!hasNext}
                    onClick={() => setPage(page + 1)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-text-grey hover:text-white disabled:opacity-50 cursor-pointer transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

const PER_PAGE = 10;

export default function TenantDetailPage() {
    const { storeId } = useParams() as { storeId: string };

    const store = useQuery(api.admin.getTenantDetail, { storeId: storeId as any });
    const members = useQuery(api.admin.getAdminStoreMembers, { storeId: storeId as any });
    const products = useQuery(api.admin.getAdminStoreProducts, { storeId: storeId as any });
    const transactions = useQuery(api.admin.getAllTransactions, {
        storeId: storeId as any,
        limit: 200,
    });
    const freezeStore = useMutation(api.admin.freezeStore);
    const unfreezeStore = useMutation(api.admin.unfreezeStore);

    const [activeTab, setActiveTab] = useState<"sellers" | "affiliates" | "products" | "transactions">("sellers");
    const [page, setPage] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);

    const handleToggleFreeze = async () => {
        setActionLoading(true);
        try {
            if (store?.status === "FROZEN") {
                await unfreezeStore({ storeId: storeId as any });
            } else {
                await freezeStore({ storeId: storeId as any });
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (!store) {
        return (
            <div className="min-h-screen flex flex-col">
                <div className="mb-6">
                    <Link href="/tenants" className="flex items-center gap-1 text-text-grey hover:text-white transition-colors mb-4">
                        <span className="material-icons text-[18px]">arrow_back</span>
                        <span>All Tenants</span>
                    </Link>
                </div>
                <p className="text-text-grey text-sm">Loading tenant details...</p>
            </div>
        );
    }

    const themeColor = store.themeColor || "#6366f1";

    // Tab content slicing
    const sellers = members?.sellers ?? [];
    const affiliates = members?.affiliates ?? [];
    const prods = products ?? [];
    const txs = transactions ?? [];

    const sellersPage = sellers.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
    const affiliatesPage = affiliates.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
    const productsPage = prods.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
    const transactionsPage = txs.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

    const isLoading = !store || !members || !products || !transactions;

    return (
        <div>
            {/* Back Button */}
            <div className="mb-6">
                <Link href="/tenants" className="flex items-center gap-1 text-text-grey hover:text-white transition-colors">
                    <span className="material-icons text-[18px]">arrow_back</span>
                    <span className="text-sm">All Tenants</span>
                </Link>
            </div>

            {/* Header Card */}
            {isLoading ? (
                <div className="mb-6 bg-surface-dark border border-white/5 rounded-2xl p-6 animate-pulse">
                    <div className="h-6 bg-white/5 rounded w-1/3 mb-4" />
                    <div className="h-4 bg-white/5 rounded w-1/4" />
                </div>
            ) : (
                <div
                    className="mb-6 bg-surface-dark border border-white/5 rounded-2xl p-6 flex items-start justify-between"
                    style={{ borderLeft: "3px solid " + themeColor }}
                >
                    <div>
                        <h1 className="text-white text-2xl font-bold">{store.name}</h1>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 border border-white/10 text-text-grey">
                                {store.slug}
                            </span>
                            {store.pspStatus && (
                                <span
                                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        store.pspStatus === "CONNECTED"
                                            ? "text-green-400 bg-green-400/10 border border-green-400/20"
                                            : "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20"
                                    }`}
                                >
                                    {store.pspStatus === "CONNECTED" ? "Stripe Connected" : "Pending Setup"}
                                </span>
                            )}
                        </div>
                        <p className="text-text-grey text-sm mt-3">Owner: {store.ownerEmail}</p>
                    </div>
                    <div className="flex flex-col gap-3 items-end">
                        <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                                store.status === "FROZEN"
                                    ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                                    : "text-green-400 bg-green-400/10 border-green-400/20"
                            }`}
                        >
                            {store.status}
                        </span>
                        <button
                            onClick={handleToggleFreeze}
                            disabled={actionLoading}
                            className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                                store.status === "FROZEN"
                                    ? "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                                    : "border border-white/10 text-text-grey hover:text-white"
                            }`}
                        >
                            {actionLoading ? "..." : store.status === "FROZEN" ? "Unfreeze" : "Freeze"}
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Strip */}
            {isLoading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }} className="mb-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-surface-dark border border-white/5 rounded-2xl p-6 animate-pulse">
                            <div className="h-4 bg-white/5 rounded w-1/2 mb-4" />
                            <div className="h-8 bg-white/5 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }} className="mb-6">
                    <StatCard
                        label="Revenue"
                        value={formatCents(
                            txs.filter((t: any) => t.status === "PAID").reduce((sum: number, t: any) => sum + t.amountTotalCents, 0)
                        )}
                        icon="attach_money"
                        valueColor={themeColor}
                    />
                    <StatCard
                        label="Transactions"
                        value={txs.length}
                        subValue={`${txs.filter((t: any) => t.status === "PAID").length} paid`}
                        icon="receipt_long"
                    />
                    <StatCard label="Sellers" value={sellers.length} icon="people" />
                    <StatCard label="Affiliates" value={affiliates.length} icon="group" />
                </div>
            )}

            {/* Theme Color Preview */}
            {!isLoading && (
                <div className="mb-6 bg-surface-dark border border-white/5 rounded-2xl p-6">
                    <p className="text-text-grey text-xs uppercase tracking-widest font-semibold mb-3">Theme Color</p>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg border border-white/10" style={{ backgroundColor: themeColor }} />
                        <p className="text-white font-mono text-sm">{themeColor}</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            {!isLoading && (
                <>
                    <div className="flex gap-6 border-b border-white/5 mb-6">
                        {(["sellers", "affiliates", "products", "transactions"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setPage(0);
                                }}
                                className="text-sm font-medium text-text-grey hover:text-white transition-colors pb-3"
                                style={{
                                    borderBottomColor: activeTab === tab ? themeColor : "transparent",
                                    borderBottomWidth: activeTab === tab ? "2px" : "0",
                                    paddingBottom: "11px",
                                }}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Sellers Tab */}
                    {activeTab === "sellers" && (
                        <div className="rounded-2xl border border-white/5 bg-surface-dark overflow-x-auto">
                            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {["Email", "Status", "Joined"].map((h) => (
                                            <th key={h} className="text-left px-6 py-3 text-text-grey text-xs uppercase tracking-wider font-medium">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sellers.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-text-grey">
                                                No sellers found.
                                            </td>
                                        </tr>
                                    )}
                                    {members === undefined && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={3} />)}
                                    {sellers.length > 0 &&
                                        sellersPage.map((seller: any) => (
                                            <tr key={seller.membershipId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-white text-sm">{seller.email}</td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                                            seller.status === "APPROVED"
                                                                ? "text-green-400 bg-green-400/10 border-green-400/20"
                                                                : seller.status === "PENDING"
                                                                ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                                                                : "text-red-400 bg-red-400/10 border-red-400/20"
                                                        }`}
                                                    >
                                                        {seller.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-text-grey text-xs">{new Date(seller.joinedAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                            {sellers.length > 0 && <PaginationControl page={page} setPage={setPage} totalItems={sellers.length} perPage={PER_PAGE} />}
                        </div>
                    )}

                    {/* Affiliates Tab */}
                    {activeTab === "affiliates" && (
                        <div className="rounded-2xl border border-white/5 bg-surface-dark overflow-x-auto">
                            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {["Email", "Status", "Joined"].map((h) => (
                                            <th key={h} className="text-left px-6 py-3 text-text-grey text-xs uppercase tracking-wider font-medium">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {affiliates.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-text-grey">
                                                No affiliates found.
                                            </td>
                                        </tr>
                                    )}
                                    {members === undefined && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={3} />)}
                                    {affiliates.length > 0 &&
                                        affiliatesPage.map((affiliate: any) => (
                                            <tr key={affiliate.membershipId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-white text-sm">{affiliate.email}</td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                                            affiliate.status === "APPROVED"
                                                                ? "text-green-400 bg-green-400/10 border-green-400/20"
                                                                : affiliate.status === "PENDING"
                                                                ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                                                                : "text-red-400 bg-red-400/10 border-red-400/20"
                                                        }`}
                                                    >
                                                        {affiliate.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-text-grey text-xs">{new Date(affiliate.joinedAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                            {affiliates.length > 0 && <PaginationControl page={page} setPage={setPage} totalItems={affiliates.length} perPage={PER_PAGE} />}
                        </div>
                    )}

                    {/* Products Tab */}
                    {activeTab === "products" && (
                        <div className="rounded-2xl border border-white/5 bg-surface-dark overflow-x-auto">
                            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {["Name", "Price", "Active", "Visits", "Revenue"].map((h) => (
                                            <th key={h} className="text-left px-6 py-3 text-text-grey text-xs uppercase tracking-wider font-medium">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {prods.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-text-grey">
                                                No products found.
                                            </td>
                                        </tr>
                                    )}
                                    {products === undefined && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={5} />)}
                                    {prods.length > 0 &&
                                        productsPage.map((product: any) => (
                                            <tr key={product._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-white font-medium max-w-[200px] truncate">{product.name}</td>
                                                <td className="px-6 py-4 text-text-grey">
                                                    ${(product.price / 100).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                                            product.isActive
                                                                ? "text-green-400 bg-green-400/10 border-green-400/20"
                                                                : "text-red-400 bg-red-400/10 border-red-400/20"
                                                        }`}
                                                    >
                                                        {product.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-text-grey">{product.visits}</td>
                                                <td className="px-6 py-4 text-white font-medium">{formatCents(product.totalRevenueCents)}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                            {prods.length > 0 && <PaginationControl page={page} setPage={setPage} totalItems={prods.length} perPage={PER_PAGE} />}
                        </div>
                    )}

                    {/* Transactions Tab */}
                    {activeTab === "transactions" && (
                        <div className="rounded-2xl border border-white/5 bg-surface-dark overflow-x-auto">
                            <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: "900px" }}>
                                <thead>
                                    <tr className="border-b border-white/5">
                                        {["Ref", "Seller", "Amount", "Platform Fee", "Seller Net", "Status", "Date"].map((h) => (
                                            <th key={h} className="text-left px-4 py-3 text-text-grey text-xs uppercase tracking-wider font-medium whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {txs.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-text-grey">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    )}
                                    {transactions === undefined && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={7} />)}
                                    {txs.length > 0 &&
                                        transactionsPage.map((tx: any) => {
                                            const statusClass = STATUS_STYLES[tx.status] ?? "text-text-grey bg-white/5 border-white/10";
                                            return (
                                                <tr key={tx._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 font-mono text-text-grey text-[11px] whitespace-nowrap">{tx.externalReference}</td>
                                                    <td className="px-4 py-3 text-text-grey text-[11px] whitespace-nowrap">{tx.sellerEmail}</td>
                                                    <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">{formatCents(tx.amountTotalCents)}</td>
                                                    <td className="px-4 py-3 text-text-grey whitespace-nowrap">{formatCents(tx.feePlatformCents)}</td>
                                                    <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{formatCents(tx.netSellerCents)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusClass}`}>
                                                            {tx.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-text-grey text-[11px] whitespace-nowrap">
                                                        {new Date(tx.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                            {txs.length > 0 && <PaginationControl page={page} setPage={setPage} totalItems={txs.length} perPage={PER_PAGE} />}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
