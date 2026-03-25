"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useTranslations } from "next-intl";

export type ProductInitialData = {
    _id: Id<"products">;
    name: string;
    description?: string;
    price: number;
    currency: string;
    coverImageUrl?: string | null;
    mediaIds?: Id<"_storage">[];
    mediaUrls?: (string | null)[];
};

export function ProductDrawer({
    isOpen,
    onClose,
    initialData,
}: {
    isOpen: boolean;
    onClose: () => void;
    initialData?: ProductInitialData | null;
}) {
    const t = useTranslations("ProductDrawer");
    
    // Form fields
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [currency, setCurrency] = useState("USD");

    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [digitalFile, setDigitalFile] = useState<File | null>(null);
    
    // Gallery State: Can be existing URLs mapped back to their IDs, or newly uploaded Files
    const [gallery, setGallery] = useState<(File | { id: Id<"_storage">, url: string })[]>([]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const coverInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const drawerRef = useRef<HTMLDivElement>(null);

    const generateUploadUrl = useMutation(api.products.generateUploadUrl);
    const createProduct = useMutation(api.products.createProduct);
    const updateProduct = useMutation(api.products.updateProduct);

    // Populate form when editing and drawer opens
    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name);
            setDescription(initialData.description || "");
            setPrice(initialData.price.toString());
            setCurrency(initialData.currency);
            
            // Reconstruct existing gallery
            if (initialData.mediaIds && initialData.mediaUrls && initialData.mediaIds.length === initialData.mediaUrls.length) {
                const existingGallery = initialData.mediaIds
                    .map((id, index) => ({
                        id,
                        url: initialData.mediaUrls![index]
                    }))
                    .filter((item): item is { id: Id<"_storage">, url: string } => item.url !== null);
                setGallery(existingGallery);
            } else {
                setGallery([]);
            }
        } else if (isOpen && !initialData) {
             // Reset if creating new
            setName(""); setDescription(""); setPrice(""); setCurrency("USD");
            setCoverImage(null); setDigitalFile(null); setGallery([]);
        }
    }, [isOpen, initialData]);

    // Handle clicking outside the drawer to close it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Element;
            if (target.closest("#add-product-trigger") || target.closest("#edit-product-trigger")) {
                return;
            }
            if (drawerRef.current && !drawerRef.current.contains(target as Node)) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setGallery(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeGalleryItem = (index: number) => {
        setGallery(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price) return alert(t("namePriceRequired") || "Name and price required");
        setIsSubmitting(true);

        try {
            let coverImageId = undefined;
            let fileId = undefined;

            // Upload single files
            if (coverImage) {
                const postUrl = await generateUploadUrl();
                const result = await fetch(postUrl, { method: "POST", headers: { "Content-Type": coverImage.type }, body: coverImage });
                const { storageId } = await result.json();
                coverImageId = storageId;
            }
            if (digitalFile) {
                const postUrl = await generateUploadUrl();
                const result = await fetch(postUrl, { method: "POST", headers: { "Content-Type": digitalFile.type }, body: digitalFile });
                const { storageId } = await result.json();
                fileId = storageId;
            }

            // Upload new gallery files and retain existing ones
            const mediaIds: Id<"_storage">[] = [];
            for (const item of gallery) {
                if ('id' in item) {
                    // Already an existing stored image
                    mediaIds.push(item.id);
                } else if (item instanceof File) {
                    // Newly uploaded file
                    const postUrl = await generateUploadUrl();
                    const result = await fetch(postUrl, { method: "POST", headers: { "Content-Type": item.type }, body: item });
                    const { storageId } = await result.json();
                    mediaIds.push(storageId);
                }
            }

            if (initialData) {
                await updateProduct({
                    productId: initialData._id,
                    name,
                    description,
                    price: parseFloat(price),
                    currency,
                    mediaIds,
                    ...(coverImageId && { coverImageId }),
                    ...(fileId && { fileId })
                });
            } else {
                await createProduct({
                    name,
                    description,
                    price: parseFloat(price),
                    currency,
                    coverImageId,
                    fileId,
                    mediaIds
                });
                
                // Clear on create only
                setName(""); setDescription(""); setPrice(""); 
                setCoverImage(null); setDigitalFile(null); setGallery([]);
            }

            setIsSubmitting(false);
            onClose();

        } catch (error) {
            console.error("Failed to commit product:", error);
            alert(t("failedToCreate") || "Operation failed.");
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div ref={drawerRef} className="fixed top-20 right-0 bottom-0 w-full max-w-[480px] bg-[#121212] border-l border-[#2a2a2a] flex flex-col animate-in slide-in-from-right duration-300 z-40 font-sans">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a2a] shrink-0">
                <h2 className="text-white text-xl font-bold tracking-tight">{initialData ? "Edit Product" : t("createNewProduct")}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#2a2a2a] cursor-pointer">
                    <span className="material-icons">close</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">{t("productName") || "PRODUCT NAME"}</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-[#050505] border border-[#2a2a2a] rounded-lg h-12 px-4 text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Enterprise Plan" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">{t("description") || "DESCRIPTION"}</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#050505] border border-[#2a2a2a] rounded-lg p-4 text-white focus:outline-none focus:border-primary transition-colors min-h-[120px] resize-none" placeholder="Describe the product..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">{t("price") || "PRICE"}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full bg-[#050505] border border-[#2a2a2a] rounded-lg h-12 pl-8 pr-4 text-white focus:outline-none focus:border-primary transition-colors" placeholder="0.00" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">{t("currency") || "CURRENCY"}</label>
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-[#050505] border border-[#2a2a2a] rounded-lg h-12 px-4 text-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer">
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">{t("productImage") || "COVER IMAGE"}</label>
                            <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] || null)} />
                            <div onClick={() => coverInputRef.current?.click()} className="group relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[#2a2a2a] bg-[#050505] px-6 py-6 hover:border-primary/50 hover:bg-[#0a0a0a] cursor-pointer transition-colors">
                                <span className="material-icons text-gray-500 mb-1">image</span>
                                <p className="text-sm font-medium text-white">{coverImage ? coverImage.name : initialData?.coverImageUrl ? "Replace Current Cover" : (t("uploadCoverImage") || "Upload Cover")}</p>
                            </div>
                        </div>

                        {/* GALLERY UPLOAD */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">Product Gallery</label>
                                <span className="text-xs text-gray-500">{gallery.length} / 5 Images</span>
                            </div>
                            
                            <input type="file" ref={galleryInputRef} multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                            
                            {/* Gallery Preview Grid */}
                            {gallery.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {gallery.map((item, idx) => {
                                        const src = item instanceof File ? URL.createObjectURL(item) : item.url;
                                        return (
                                            <div key={idx} className="aspect-square relative rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden group">
                                                <img src={src} className="w-full h-full object-cover" alt="Gallery preview" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeGalleryItem(idx)}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
                                                >
                                                    <span className="material-icons text-[14px]">close</span>
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {gallery.length < 5 && (
                                <div onClick={() => galleryInputRef.current?.click()} className="group relative flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#2a2a2a] bg-[#050505] px-4 py-4 hover:border-primary/50 hover:bg-[#0a0a0a] cursor-pointer transition-colors">
                                    <span className="material-icons text-gray-500 text-sm">add_photo_alternate</span>
                                    <p className="text-sm font-medium text-white">Add Gallery Images</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 tracking-wider uppercase">{t("digitalAssets") || "DIGITAL FILE"}</label>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setDigitalFile(e.target.files?.[0] || null)} />
                            <div onClick={() => fileInputRef.current?.click()} className="group relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[#2a2a2a] bg-[#050505] px-6 py-6 hover:border-primary/50 hover:bg-[#0a0a0a] cursor-pointer transition-colors">
                                <span className="material-icons text-gray-500 mb-1">file_present</span>
                                <p className="text-sm font-medium text-white">{digitalFile ? digitalFile.name : initialData ? "Replace Digital File" : (t("uploadDigitalFile") || "Upload File")}</p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div className="flex items-center justify-between px-6 py-5 border-t border-[#2a2a2a] bg-[#121212] shrink-0">
                <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-gray-400 text-sm font-medium hover:text-white transition-colors cursor-pointer">{t("cancel") || "Cancel"}</button>
                <button form="product-form" type="submit" disabled={isSubmitting} className="px-8 py-2.5 rounded-lg bg-primary text-black text-sm font-bold shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                    {isSubmitting ? (t("saving") || "Saving...") : initialData ? "Save Changes" : (t("saveProduct") || "Create")}
                </button>
            </div>
        </div>
    );
}
