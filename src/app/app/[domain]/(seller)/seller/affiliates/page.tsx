"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard";
import { Id } from "../../../../../../../convex/_generated/dataModel";

export default function SellerAffiliatesPage() {
    const t = useTranslations("SellerAffiliates");
    const storeSlug = useQuery(api.memberships.getMyStoreSlug);
    const currentUser = useQuery(api.memberships.getCurrentUser);
    const myPspStatus = useQuery(api.paymentsHelpers.getSellerPaymentStatus);
    const myPsp = myPspStatus?.activePsp ?? null;
    const affiliates = useQuery(
        api.memberships.getStoreAffiliates,
        storeSlug ? { storeSlug } : "skip"
    );
    const updateStatus = useMutation(api.memberships.updateMembershipStatus);
    const [copied, setCopied] = useState(false);

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";
    const inviteLink = storeSlug
        ? `${protocol}//${storeSlug}.${rootDomain}/affiliates`
        : null;

    const copyInviteLink = () => {
        if (!inviteLink) return;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAction = async (membershipId: Id<"memberships">, status: "APPROVED" | "REJECTED") => {
        await updateStatus({ membershipId, status });
    };

    const pendingCount = affiliates?.filter((a) => a.status === "PENDING").length ?? 0;
    const approvedCount = affiliates?.filter((a) => a.status === "APPROVED").length ?? 0;

    return (
        <>
            <TopNav title={t("title")} />
            <div className="p-8 relative z-0 space-y-8 w-full">

                {/* Invite Link Card */}
                <div className="bg-surface-dark border border-white/5 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <span className="material-icons text-primary text-xl">share</span>
                        </div>
                        <div>
                            <p className="text-white text-sm font-bold">{t("inviteLink")}</p>
                            <p className="text-text-grey text-xs mt-0.5">{t("shareWithPotential")}</p>
                        </div>
                    </div>
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                        <div className="flex-1 bg-black/30 border border-white/5 rounded-full px-4 py-2.5 text-xs text-text-grey font-mono truncate">
                            {inviteLink ?? t("loading")}
                        </div>
                        <button
                            onClick={copyInviteLink}
                            disabled={!inviteLink}
                            className="flex-shrink-0 flex items-center gap-2 bg-primary hover:brightness-110 disabled:opacity-40 text-black text-xs font-bold px-4 py-2.5 rounded-full transition-all shadow-glow hover:shadow-glow-sm cursor-pointer"
                        >
                            <span className="material-icons text-[14px]">
                                {copied ? "check" : "content_copy"}
                            </span>
                            {copied ? t("copied") : t("copy")}
                        </button>
                    </div>
                </div>

                {/* PSP Warning */}
                {myPsp === null && myPspStatus !== undefined && affiliates !== undefined && (
                    <a
                        href="/seller/payments"
                        className="flex items-center gap-3 bg-amber-500/[0.06] border border-amber-500/20 rounded-lg p-4 hover:brightness-110 transition-all cursor-pointer"
                    >
                        <span className="material-icons text-amber-400 text-2xl flex-shrink-0">warning</span>
                        <div className="flex-1">
                            <p className="text-amber-400 text-sm font-bold">{t("linksNotFunctional")}</p>
                            <p className="text-text-grey text-xs mt-0.5">{t("connectPspNote")}</p>
                        </div>
                        <span className="material-icons text-text-grey text-lg flex-shrink-0">arrow_forward</span>
                    </a>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="group bg-surface-dark border border-white/5 p-6 rounded-lg relative overflow-hidden hover:border-white/10 transition-colors duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-text-grey text-sm font-medium mb-1">{t("totalAffiliates")}</p>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{affiliates?.length ?? "—"}</h3>
                            </div>
                            <div className="bg-white/5 p-2 rounded-full">
                                <span className="material-icons text-white text-xl">group</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-text-grey text-sm font-medium">
                            <span>{t("registeredPartners")}</span>
                        </div>
                    </div>

                    <div className="group bg-surface-dark border border-white/5 p-6 rounded-lg relative overflow-hidden hover:border-white/10 transition-colors duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-text-grey text-sm font-medium mb-1">{t("pendingApproval")}</p>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{pendingCount}</h3>
                            </div>
                            <div className="bg-amber-500/10 p-2 rounded-full">
                                <span className="material-icons text-amber-400 text-xl">hourglass_empty</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 text-sm font-medium">
                            <span>{t("requiresAction")}</span>
                        </div>
                    </div>

                    <div className="group bg-surface-dark border border-white/5 p-6 rounded-lg relative overflow-hidden hover:border-white/10 transition-colors duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-text-grey text-sm font-medium mb-1">{t("activePartners")}</p>
                                <h3 className="text-3xl font-bold text-white tracking-tight">{approvedCount}</h3>
                            </div>
                            <div className="bg-primary/10 p-2 rounded-full">
                                <span className="material-icons text-primary text-xl">verified</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-primary text-sm font-medium">
                            <span>{t("drivingTraffic")}</span>
                        </div>
                    </div>
                </div>

                {/* Affiliates Table */}
                <div className="bg-surface-dark border border-white/5 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white tracking-tight">{t("affiliateQueue")}</h2>
                        {pendingCount > 0 && (
                            <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20">
                                {t("pendingCount", { count: pendingCount })}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-text-grey text-xs font-medium uppercase tracking-widest">
                        <div className="col-span-4">{t("affiliate")}</div>
                        <div className="col-span-2">{t("role")}</div>
                        <div className="col-span-2">{t("status")}</div>
                        <div className="col-span-2">{t("joined")}</div>
                        <div className="col-span-2 text-right">{t("actions")}</div>
                    </div>

                    {affiliates === undefined && (
                        <div className="px-6 py-12 text-center text-text-grey">
                            <span className="material-icons text-4xl mb-2 block animate-pulse">sync</span>
                            <p className="text-sm">{t("loadingAffiliates")}</p>
                        </div>
                    )}

                    {affiliates && affiliates.length === 0 && (
                        <div className="px-6 py-16 text-center">
                            <span className="material-icons text-4xl text-text-grey mb-3 block">group_off</span>
                            <p className="text-white font-medium mb-1">{t("noAffiliatesYet")}</p>
                            <p className="text-text-grey text-sm">{t("sharePortalLink")}</p>
                        </div>
                    )}

                    {affiliates?.map((affiliate) => (
                        <div
                            key={affiliate._id}
                            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors"
                        >
                            <div className="col-span-4 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                    <span className="material-icons text-text-grey text-lg">person</span>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm text-white font-medium truncate">{affiliate.affiliateEmail}</p>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <span className="text-xs font-medium text-text-grey bg-white/5 px-2 py-1 rounded-full">{affiliate.role}</span>
                            </div>

                            <div className="col-span-2">
                                {affiliate.status === "PENDING" && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span>
                                        </span>
                                        {t("pending")}
                                    </span>
                                )}
                                {affiliate.status === "APPROVED" && (
                                    <span className="text-xs text-text-grey">{t("approved")}</span>
                                )}
                                {affiliate.status === "REJECTED" && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                                        <span className="material-icons text-[12px]">cancel</span>
                                        {t("rejected")}
                                    </span>
                                )}
                            </div>

                            <div className="col-span-2 text-sm text-text-grey">
                                {new Date(affiliate.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>

                            <div className="col-span-2 flex items-center justify-end gap-2">
                                {affiliate.status === "PENDING" && (
                                    <>
                                        <button onClick={() => handleAction(affiliate._id, "APPROVED")} className="bg-primary hover:brightness-110 text-black text-xs font-bold px-4 py-2 rounded-full transition-all shadow-glow hover:shadow-glow-sm flex items-center gap-1.5 cursor-pointer">
                                            <span className="material-icons text-[14px]">check</span>
                                            {t("approve")}
                                        </button>
                                        <button onClick={() => handleAction(affiliate._id, "REJECTED")} className="bg-white/5 hover:bg-red-500/10 text-text-grey hover:text-red-400 text-xs font-bold px-4 py-2 rounded-full border border-white/5 hover:border-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer">
                                            <span className="material-icons text-[14px]">close</span>
                                            {t("reject")}
                                        </button>
                                    </>
                                )}
                                {affiliate.status === "APPROVED" && (
                                    <span className="text-xs text-text-grey">{t("approved")}</span>
                                )}
                                {affiliate.status === "REJECTED" && (
                                    <button onClick={() => handleAction(affiliate._id, "APPROVED")} className="bg-white/5 hover:bg-primary/10 text-text-grey hover:text-primary text-xs font-bold px-4 py-2 rounded-full border border-white/5 hover:border-primary/20 transition-all flex items-center gap-1.5 cursor-pointer">
                                        <span className="material-icons text-[14px]">undo</span>
                                        {t("reApprove")}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
