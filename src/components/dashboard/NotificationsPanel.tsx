"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

export function NotificationsPanel() {
    const t = useTranslations("DashboardTopNav");
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={panelRef}>
            {/* Notification Button */}
            <button
                className={`relative w-10 h-10 rounded-full border border-white/5 bg-surface-dark flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer ${isOpen ? "text-white bg-white/5" : "text-text-grey hover:text-white"
                    }`}
                title={t("notifications")}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="material-icons text-[20px]">notifications</span>
                {/* Removed the 'shadow-glow' "move notifications thing" and just kept a simple indicator if we want, or completely removed it. The user said "remove the move notifications things" so I removed the shadow-glow animation/moving dot. Actually they might have meant the dot entirely, let's just keep a static un-animated dot or remove the whole dot. Let's remove the dot entirely since the notification is a static welcome note. */}
            </button>

            {/* Notifications Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface-dark border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                        <h3 className="text-white font-medium">{t("notifications")}</h3>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto">
                        {/* Welcome Note */}
                        <div className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="material-icons text-primary text-[20px]">waving_hand</span>
                            </div>
                            <div>
                                <p className="text-sm text-white font-medium mb-1">
                                    {t("welcomeNewUser")}
                                </p>
                                <p className="text-xs text-text-grey">
                                    {t("noNewNotifications")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
