"use client";

import { useQuery, useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../../../../../convex/_generated/api";
import { TopNav } from "@/components/dashboard";
import { useStoreContext } from "@/providers/store-context";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const t = useTranslations("SellerSettings");
    const { store } = useStoreContext();
    const updateStore = useMutation(api.stores.updateStoreBasicInfo);
    const generateLogoUploadUrl = useMutation(api.stores.generateLogoUploadUrl);

    // Fetch existing logo URL
    const storeLogoUrl = useQuery(
        api.stores.getLogoUrl,
        store?._id ? { storeId: store._id } : "skip"
    );

    const [name, setName] = useState("");
    const [supportEmail, setSupportEmail] = useState("");
    const [brandColor, setBrandColor] = useState("#0df20d");
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [logoHasWhiteBg, setLogoHasWhiteBg] = useState(false);
    
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (store) {
            setName(store.name || "");
            setSupportEmail(store.supportEmail || "");
            setBrandColor(store.themeColor || "#0df20d");
            setLogoHasWhiteBg(store.logoHasWhiteBg ?? false);
        }
    }, [store]);

    const handleSave = async () => {
        if (!store) return;
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            let logoStorageId = store.logoStorageId;

            if (selectedLogo) {
                const postUrl = await generateLogoUploadUrl();
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": selectedLogo.type },
                    body: selectedLogo,
                });
                if (!result.ok) throw new Error("Failed to upload logo.");
                const { storageId } = await result.json();
                logoStorageId = storageId;
            }

            await updateStore({
                storeId: store._id,
                name,
                supportEmail,
                themeColor: brandColor,
                logoStorageId,
                logoHasWhiteBg,
            });
            
            setSaveSuccess(true);
            setSelectedLogo(null);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error("Save error:", err);
            alert(t("errorSaving"));
        } finally {
            setIsSaving(false);
        }
    };

    if (store === undefined) {
        return (
            <div className="flex flex-col h-full bg-[#050505]">
                <TopNav title={t("title")} />
                <div className="p-8 flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                        <span className="material-icons text-4xl text-white/10 animate-spin">sync</span>
                        <p className="text-gray-500 text-sm font-medium">{t("loading")}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (store === null) {
        return (
            <div className="flex flex-col h-full bg-[#050505]">
                <TopNav title={t("title")} />
                <div className="p-8 flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                        <span className="material-icons text-4xl text-red-500/20">error_outline</span>
                        <p className="text-gray-500 text-sm font-medium">{t("storeNotFound")}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#050505] overflow-y-auto custom-scrollbar">
            <TopNav title={t("title")} />

            <div className="p-8 max-w-4xl mx-auto w-full pb-24">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-white tracking-tight mb-2">{t("generalSettings")}</h2>
                    <p className="text-gray-400 text-sm">{t("storeInfoNote")}</p>
                </div>

                <div className="space-y-10">
                    {/* Store Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("storeDisplayName")}</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t("placeholderName")}
                                    className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("supportEmail")}</label>
                                <input
                                    type="email"
                                    value={supportEmail}
                                    onChange={(e) => setSupportEmail(e.target.value)}
                                    placeholder={t("placeholderEmail")}
                                    className="w-full bg-[#121212] border border-white/5 rounded-xl px-4 py-3 text-white focus:border-primary/50 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Logo Info */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("storeLogo")}</label>
                            
                            <input
                                type="file"
                                ref={logoInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => setSelectedLogo(e.target.files?.[0] || null)}
                            />

                            <div className="flex flex-col gap-3">
                                <div 
                                    onClick={() => logoInputRef.current?.click()}
                                    className="relative group aspect-square max-w-[200px] w-full rounded-2xl bg-[#121212] border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 flex flex-col items-center justify-center p-4 transition-all overflow-hidden cursor-pointer"
                                >
                                    {(selectedLogo || storeLogoUrl) ? (
                                        <div className={cn(
                                            "absolute inset-2 rounded-xl flex items-center justify-center p-2 group-hover:scale-105 transition-all shadow-lg overflow-hidden border",
                                            logoHasWhiteBg ? "bg-white border-white/20" : "bg-transparent border-transparent"
                                        )}>
                                            <img 
                                                src={selectedLogo ? URL.createObjectURL(selectedLogo) : (storeLogoUrl as string)} 
                                                alt="Store Logo" 
                                                className="w-full h-full object-contain"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="material-icons text-white">edit</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="material-icons text-gray-400 group-hover:text-white transition-colors text-4xl mb-2">add_photo_alternate</span>
                                            <p className="text-gray-400 group-hover:text-white transition-colors text-[10px] text-center font-bold tracking-widest uppercase">Upload Logo</p>
                                        </>
                                    )}
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer mt-1 group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={logoHasWhiteBg}
                                            onChange={(e) => setLogoHasWhiteBg(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={cn(
                                            "w-9 h-5 rounded-full transition-colors duration-200 ease-in-out",
                                            logoHasWhiteBg ? "bg-primary" : "bg-[#2a2a2a]"
                                        )}></div>
                                        <div className={cn(
                                            "absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm",
                                            logoHasWhiteBg ? "translate-x-4" : "translate-x-0"
                                        )}></div>
                                    </div>
                                    <span className="text-xs text-gray-400 group-hover:text-white transition-colors font-medium">Add white background</span>
                                </label>
                                <p className="text-xs text-gray-500">
                                    100x100px square format recommended.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("brandAccentColor")}</label>
                            <button
                                onClick={() => setBrandColor("#0df20d")}
                                className="text-[10px] text-gray-500 hover:text-white transition-colors cursor-pointer"
                            >
                                {t("resetDefault")}
                            </button>
                        </div>
                        <div className="flex items-center gap-6 p-4 bg-[#121212] border border-white/5 rounded-2xl">
                            <div className="relative w-12 h-12 shrink-0">
                                <input
                                    type="color"
                                    value={brandColor}
                                    onChange={(e) => setBrandColor(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div
                                    className="w-full h-full rounded-xl border-2 border-white/10 shadow-lg"
                                    style={{ backgroundColor: brandColor }}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex gap-2">
                                    {['#0df20d', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setBrandColor(color)}
                                            className={cn(
                                                "w-6 h-6 rounded-full border border-white/10 transition-transform active:scale-95 cursor-pointer",
                                                brandColor === color && "ring-2 ring-white ring-offset-2 ring-offset-[#121212]"
                                            )}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            {/* Preview Badge */}
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">{t("preview")}</span>
                                <div
                                    className="px-3 py-1 rounded-full text-[10px] font-bold text-black shadow-lg"
                                    style={{ backgroundColor: brandColor }}
                                >
                                    {t("readyToSave")}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-6 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-3">
                            {saveSuccess && (
                                <div className="flex items-center gap-2 text-primary font-bold animate-in fade-in slide-in-from-left-2 transition-all">
                                    <span className="material-icons text-sm">check_circle</span>
                                    <p className="text-xs">{t("savedSuccess")}</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-primary hover:brightness-110 disabled:opacity-30 disabled:grayscale text-black text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-glow hover:shadow-glow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                            {isSaving ? (
                                <span className="material-icons text-xl animate-spin">sync</span>
                            ) : (
                                <span className="material-icons text-xl">save</span>
                            )}
                            {isSaving ? t("saving") : t("saveChanges")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
