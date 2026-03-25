"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard/TopNav";
import { useStoreContext } from "@/providers/store-context";
import { useState } from "react";

const STATUS_STYLES: Record<string, string> = {
    APPROVED: "text-green-400 bg-green-400/10 border-green-400/20",
    PENDING:  "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    REJECTED: "text-red-400 bg-red-400/10 border-red-400/20",
};

const INVITE_STATUS_STYLES: Record<string, string> = {
    PENDING:  "text-blue-400 bg-blue-400/10 border-blue-400/20",
    ACCEPTED: "text-green-400 bg-green-400/10 border-green-400/20",
    EXPIRED:  "text-text-grey bg-white/5 border-white/10",
};

export default function WLSellersPage() {
    const { store } = useStoreContext();
    const sellers = useQuery(
        api.memberships.getStoreSellers,
        store?.slug ? { storeSlug: store.slug } : "skip"
    );
    const invitations = useQuery(
        api.sellerInvitations.getStoreInvitations,
        store?._id ? { storeId: store._id } : "skip"
    );
    const updateStatus = useMutation(api.memberships.updateMembershipStatus);
    const createInvitation = useMutation(api.sellerInvitations.createInvitation);
    const revokeInvitation = useMutation(api.sellerInvitations.revokeInvitation);

    const [inviteEmail, setInviteEmail] = useState("");
    const [copiedLink, setCopiedLink] = useState<string | null>(null);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";

    const handleCreateInvite = async () => {
        if (!store?._id) return;
        setIsCreating(true);
        try {
            const result = await createInvitation({
                storeId: store._id,
                email: inviteEmail || undefined,
            });
            // Build invite URL with store subdomain so sellers see which store they're joining
            const inviteUrl = `${protocol}//${store.slug}.${rootDomain}/sign-up/seller?token=${result.token}`;
            await navigator.clipboard.writeText(inviteUrl);
            setCopiedLink(inviteUrl);
            setInviteEmail("");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
            <TopNav title="Sellers" />
            <div className="p-8 relative z-0 space-y-8 w-full">

                {/* ── Invite Section ─────────────────────────────────────── */}
                <section className="bg-surface-dark border border-white/5 rounded-2xl p-6 space-y-4">
                    <div>
                        <h3 className="text-white font-semibold text-base">Invite a Seller</h3>
                        <p className="text-text-grey text-sm mt-0.5">
                            Generate a one-time invite link to share with a seller. It expires in 7 days.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* Optional email — collapsed by default */}
                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <label className="text-xs text-text-grey uppercase tracking-widest font-semibold block mb-1.5">
                                    Email <span className="normal-case text-text-grey/60">(optional — for your records only)</span>
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="seller@example.com"
                                    className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-grey/40 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                />
                            </div>
                            <div className="relative group/invite">
                                <button
                                    onClick={handleCreateInvite}
                                    disabled={isCreating || store?.pspStatus !== "CONNECTED"}
                                    className="flex items-center gap-2 bg-primary text-black font-semibold text-sm px-5 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer whitespace-nowrap disabled:cursor-not-allowed"
                                >
                                    <span className="material-icons text-[18px]">link</span>
                                    {isCreating ? "Creating…" : "Generate Link"}
                                </button>
                                {store && store.pspStatus !== "CONNECTED" && (
                                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-surface-dark border border-white/10 rounded-lg text-xs text-text-grey whitespace-nowrap opacity-0 group-hover/invite:opacity-100 transition-opacity pointer-events-none">
                                        {store.pspProvider ? "Complete Stripe setup in Settings first" : "Connect a payment provider in Settings first"}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Copied link display */}
                        {copiedLink && (
                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="material-icons text-primary text-[18px]">check_circle</span>
                                    <span className="text-primary text-sm font-semibold">Link copied to clipboard!</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-xs text-text-grey bg-background-dark rounded-lg px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap block">
                                        {copiedLink}
                                    </code>
                                    <button
                                        onClick={async () => {
                                            await navigator.clipboard.writeText(copiedLink);
                                        }}
                                        className="flex items-center gap-1 text-xs text-text-grey hover:text-white transition-colors px-2 py-1.5 rounded-lg bg-white/5 cursor-pointer flex-shrink-0"
                                    >
                                        <span className="material-icons text-[14px]">content_copy</span>
                                        Copy
                                    </button>
                                </div>
                                <p className="text-xs text-text-grey">
                                    Share this link with the seller. They&apos;ll sign up and request to join your platform.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Pending Invitations ────────────────────────────────── */}
                {invitations && invitations.length > 0 && (
                    <section className="rounded-2xl border border-white/5 bg-surface-dark overflow-x-auto">
                        <div className="px-6 py-4 border-b border-white/5">
                            <h3 className="text-white font-semibold text-sm">Invite History</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 text-text-grey text-xs uppercase tracking-wider">
                                    <th className="text-left px-6 py-3">Email</th>
                                    <th className="text-left px-6 py-3">Invite Link</th>
                                    <th className="text-left px-6 py-3">Status</th>
                                    <th className="text-left px-6 py-3">Created</th>
                                    <th className="text-left px-6 py-3">Expires</th>
                                    <th className="text-right px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invitations.map((inv) => {
                                    const displayStatus = inv.isExpired ? "EXPIRED" : inv.status;
                                    const inviteUrl = `${protocol}//${store!.slug}.${rootDomain}/sign-up/seller?token=${inv.token}`;
                                    const isActive = inv.status === "PENDING" && !inv.isExpired;
                                    return (
                                        <tr key={String(inv._id)} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                            <td className="px-6 py-3 text-white text-xs">{inv.email ?? "—"}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2 max-w-[260px]">
                                                    <code className="text-[10px] text-text-grey bg-background-dark rounded-md px-2 py-1 overflow-hidden text-ellipsis whitespace-nowrap block flex-1">
                                                        {inviteUrl}
                                                    </code>
                                                    {isActive && (
                                                        <button
                                                            onClick={async () => {
                                                                await navigator.clipboard.writeText(inviteUrl);
                                                                setCopiedToken(inv.token);
                                                                setTimeout(() => setCopiedToken(null), 2000);
                                                            }}
                                                            className="flex items-center gap-1 text-[10px] text-text-grey hover:text-white transition-colors px-1.5 py-1 rounded-md bg-white/5 cursor-pointer flex-shrink-0"
                                                        >
                                                            <span className="material-icons text-[12px]">
                                                                {copiedToken === inv.token ? "check" : "content_copy"}
                                                            </span>
                                                            {copiedToken === inv.token ? "Copied" : "Copy"}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${INVITE_STATUS_STYLES[displayStatus] ?? ""}`}>
                                                    {displayStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-text-grey text-xs">
                                                {new Date(inv.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-3 text-text-grey text-xs">
                                                {new Date(inv.expiresAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                {isActive && (
                                                    <button
                                                        onClick={() => revokeInvitation({ invitationId: inv._id })}
                                                        className="text-xs text-text-grey hover:text-white transition-colors cursor-pointer"
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* ── Active Sellers ─────────────────────────────────────── */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-white font-bold text-lg">Seller Management</h2>
                        <p className="text-text-grey text-sm mt-0.5">
                            Approve or reject sellers requesting to join your platform.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-surface-dark overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 text-text-grey text-xs uppercase tracking-wider">
                                    <th className="text-left px-6 py-4">Seller</th>
                                    <th className="text-left px-6 py-4">Products</th>
                                    <th className="text-left px-6 py-4">PSP</th>
                                    <th className="text-left px-6 py-4">Status</th>
                                    <th className="text-right px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sellers === undefined && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-text-grey">
                                            Loading…
                                        </td>
                                    </tr>
                                )}
                                {sellers?.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-text-grey">
                                            No sellers yet. Generate an invite link above to onboard sellers.
                                        </td>
                                    </tr>
                                )}
                                {sellers?.map((s) => (
                                    <tr key={String(s.membershipId)} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                        <td className="px-6 py-4 text-white font-medium">{s.email}</td>
                                        <td className="px-6 py-4 text-text-grey">{s.productCount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold ${s.pspConnected ? "text-green-400" : "text-text-grey"}`}>
                                                {s.pspConnected ? "Connected" : "Not connected"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${STATUS_STYLES[s.status] ?? STATUS_STYLES["PENDING"]}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            {s.status === "PENDING" && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus({ membershipId: s.membershipId, status: "APPROVED" })}
                                                        className="text-xs px-3 py-1.5 rounded-lg bg-primary text-black font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus({ membershipId: s.membershipId, status: "REJECTED" })}
                                                        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-text-grey hover:text-white transition-colors cursor-pointer"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {s.status === "APPROVED" && (
                                                <span className="text-xs text-text-grey">Active</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </>
    );
}
