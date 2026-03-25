"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";

export default function FeesPage() {
    const feeConfigs = useQuery(api.platformFees.getAllFeeConfigs);
    const stores = useQuery(api.admin.listAllStores);
    const upsertGlobal = useMutation(api.platformFees.upsertGlobalFee);
    const upsertStore = useMutation(api.platformFees.upsertStoreFee);
    const deleteOverride = useMutation(api.platformFees.deleteStoreFee);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editPercent, setEditPercent] = useState("");
    const [editFlat, setEditFlat] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSaveGlobal = async () => {
        setSaving(true);
        try {
            await upsertGlobal({
                feePercent: parseFloat(editPercent),
                feeFlatCents: parseInt(editFlat) || 0,
            });
            setEditingId(null);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveOverride = async (storeId: any) => {
        setSaving(true);
        try {
            await upsertStore({
                storeId,
                feePercent: parseFloat(editPercent),
                feeFlatCents: parseInt(editFlat) || 0,
            });
            setEditingId(null);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteOverride = async (storeId: any) => {
        if (!confirm("Remove this per-store override? The store will fall back to the global default.")) return;
        try {
            await deleteOverride({ storeId });
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (!feeConfigs || !stores) {
        return <p className="text-text-grey text-sm">Loading fee configs...</p>;
    }

    // Get global fee config
    const globalConfig = feeConfigs.find((c: any) => c.isGlobal);

    // Build merged list: global config + all stores with their fees
    const mergedConfigs = [
        ...(globalConfig ? [globalConfig] : []),
        ...stores.map((store: any) => {
            const override = feeConfigs.find((c: any) => c.storeId === store._id);
            if (override) {
                return override;
            }
            // Create a synthetic config for stores without an override (using global defaults)
            return {
                _id: `store_${store._id}`,
                storeId: store._id,
                storeName: store.name,
                storeSlug: store.slug,
                isGlobal: false,
                isDefault: true, // Mark as "using global default"
                feePercent: globalConfig?.feePercent ?? 5,
                feeFlatCents: globalConfig?.feeFlatCents ?? 0,
                updatedAt: null,
            };
        })
    ];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-white text-2xl font-bold">Platform Fees</h2>
                <p className="text-text-grey text-sm mt-1">
                    Configure Triadpay's fee on every transaction. Per-store overrides take precedence over the global default.
                </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-surface-dark overflow-x-auto mb-6">
                <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                    <thead>
                        <tr className="border-b border-white/5">
                            {["Type", "Store", "Fee %", "Flat (¢)", "Updated", "Actions"].map((h) => (
                                <th key={h} className="text-left px-6 py-3 text-text-grey text-xs uppercase tracking-wider font-medium">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {mergedConfigs.map((config: any) => {
                            const isEditing = editingId === (config._id ?? "global");
                            const isGlobal = config.isGlobal;
                            const isDefault = config.isDefault; // Using global default, not an override
                            return (
                                <tr key={config._id ?? "global"} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                            isGlobal
                                                ? "text-white bg-white/5 border-white/10"
                                                : isDefault
                                                ? "text-text-grey bg-white/5 border-white/10"
                                                : "text-text-grey bg-white/5 border-white/10"
                                        }`}>
                                            {isGlobal ? "GLOBAL" : isDefault ? "DEFAULT" : "OVERRIDE"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white">
                                        {config.storeName}
                                        {config.storeSlug && (
                                            <span className="text-text-grey text-xs ml-1.5">({config.storeSlug})</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editPercent}
                                                onChange={(e) => setEditPercent(e.target.value)}
                                                placeholder="0.0"
                                                className="w-20 px-3 py-2 bg-background-dark border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20"
                                            />
                                        ) : (
                                            <span className="text-white font-semibold">{config.feePercent}%</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={editFlat}
                                                onChange={(e) => setEditFlat(e.target.value)}
                                                placeholder="0"
                                                className="w-20 px-3 py-2 bg-background-dark border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20"
                                            />
                                        ) : (
                                            <span className="text-text-grey">{config.feeFlatCents}¢</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-text-grey text-xs">
                                        {!isEditing && (config.updatedAt ? new Date(config.updatedAt).toLocaleDateString() : "—")}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => config.isGlobal ? handleSaveGlobal() : handleSaveOverride(config.storeId)}
                                                    disabled={saving}
                                                    className="text-xs px-4 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 cursor-pointer disabled:opacity-50 transition-colors font-medium"
                                                >
                                                    {saving ? "Saving..." : "Save"}
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="text-xs px-4 py-2 rounded-lg bg-white/5 text-text-grey hover:text-white border border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(config._id ?? "global");
                                                        setEditPercent(String(config.feePercent));
                                                        setEditFlat(String(config.feeFlatCents));
                                                    }}
                                                    className="text-xs px-4 py-2 rounded-lg border border-white/10 text-text-grey hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                {!isGlobal && !isDefault && (
                                                    <button
                                                        onClick={() => handleDeleteOverride(config.storeId)}
                                                        className="text-xs px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 cursor-pointer transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
