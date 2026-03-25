import React from "react";

// ─── Size presets ───────────────────────────────────────────────────────────
type LogoSize = "sm" | "md" | "lg";

const sizeClasses: Record<LogoSize, string> = {
    sm: "h-8",
    md: "h-20",
    lg: "h-32",
};

// ─── Stripe ─────────────────────────────────────────────────────────────────
// Official Stripe wordmark – path traced from the brand asset.
export function StripeLogo({ size = "md" }: { size?: LogoSize }) {
    return (
        <svg
            viewBox="0 0 468 222.5"
            xmlns="http://www.w3.org/2000/svg"
            className={`${sizeClasses[size]} w-auto`}
            role="img"
            aria-label="Stripe"
        >
            <title>Stripe</title>
            {/* Subtle glow behind the wordmark */}
            <defs>
                <filter id="stripe-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="stripe-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#635bff" />
                    <stop offset="50%" stopColor="#7a73ff" />
                    <stop offset="100%" stopColor="#635bff" />
                </linearGradient>
            </defs>
            <path
                fill="url(#stripe-grad)"
                filter="url(#stripe-glow)"
                d="M414 113.4c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.3 41.4 45.3 11.9 0 20.9-2.7 27.7-6.5v-20c-6.8 3.4-14.6 5.5-24.5 5.5-9.7 0-18.3-3.4-19.4-15.2h48.9c0-1.3.2-6.5.2-8.9zm-49.4-9.5c0-11.3 6.9-16 13.2-16 6.1 0 12.6 4.7 12.6 16h-25.8zM301.1 67.6c-9.8 0-16.1 4.6-19.6 7.8l-1.3-6.2h-22v116.6l25-5.3.1-28.3c3.6 2.6 8.9 6.3 17.7 6.3 17.9 0 34.2-14.4 34.2-46.1-.1-29-16.6-44.8-34.1-44.8zm-6 68.9c-5.9 0-9.4-2.1-11.8-4.7l-.1-37.1c2.6-2.9 6.2-4.9 11.9-4.9 9.1 0 15.4 10.2 15.4 23.3 0 13.4-6.2 23.4-15.4 23.4zM223.8 61.7l25.1-5.4V36l-25.1 5.3zM223.8 69.3h25.1v87.5h-25.1zM196.9 76.7l-1.6-7.4h-21.6v87.5h25V97.5c5.9-7.7 15.9-6.3 19-5.2v-23c-3.2-1.2-14.9-3.4-20.8 7.4zM146.9 47.6l-24.4 5.2-.1 80.1c0 14.8 11.1 25.7 25.9 25.7 8.2 0 14.2-1.5 17.5-3.3V135c-3.2 1.3-19 5.9-19-8.9V90.6h19V69.3h-19l.1-21.7zM79.3 94.7c0-3.9 3.2-5.4 8.5-5.4 7.6 0 17.2 2.3 24.8 6.4V72.2c-8.3-3.3-16.5-4.6-24.8-4.6C67.5 67.6 52 78.8 52 97.4c0 28.9 39.8 24.3 39.8 36.7 0 4.6-4 6.1-9.6 6.1-8.3 0-18.9-3.4-27.3-8v23.8c9.3 4 18.7 5.7 27.3 5.7 20.8 0 35.1-10.3 35.1-29.4-.1-31.2-40-25.7-40-37.6z"
            />
        </svg>
    );
}

// ─── Mercado Pago ───────────────────────────────────────────────────────────
// Handshake icon + two-line wordmark with vivid brand colours.
export function MercadoPagoLogo({ size = "md" }: { size?: LogoSize }) {
    const containerClasses: Record<LogoSize, string> = {
        sm: "gap-1.5",
        md: "gap-3",
        lg: "gap-4",
    };

    const iconSizes: Record<LogoSize, string> = {
        sm: "w-9 h-9",
        md: "w-20 h-20",
        lg: "w-28 h-28",
    };

    const textSizes: Record<LogoSize, { top: string; bottom: string }> = {
        sm: { top: "text-xs", bottom: "text-xs" },
        md: { top: "text-2xl", bottom: "text-2xl" },
        lg: { top: "text-3xl", bottom: "text-3xl" },
    };

    return (
        <div
            className={`flex items-center ${containerClasses[size]}`}
            role="img"
            aria-label="Mercado Pago"
        >
            {/* Handshake icon */}
            <svg
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                className={iconSizes[size]}
            >
                <defs>
                    <linearGradient id="mp-oval-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00287a" />
                        <stop offset="100%" stopColor="#003da5" />
                    </linearGradient>
                    <filter id="mp-shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#009ee3" floodOpacity="0.3" />
                    </filter>
                </defs>
                {/* Filled oval background */}
                <ellipse cx="50" cy="50" rx="46" ry="40" fill="url(#mp-oval-grad)" filter="url(#mp-shadow)" />
                {/* Handshake – simplified, recognisable silhouette */}
                <g fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.95">
                    {/* Left arm */}
                    <path d="M12 55 L24 42 C28 38 33 38 36 41 L50 52" fill="none" strokeWidth="3" />
                    {/* Right arm */}
                    <path d="M88 55 L76 42 C72 38 67 38 64 41 L50 52" fill="none" strokeWidth="3" />
                    {/* Clasped middle */}
                    <path d="M36 52 C40 58 45 61 50 61 C55 61 60 58 64 52" fill="none" strokeWidth="2.5" />
                    {/* Fingers – small, rounded */}
                    <circle cx="36" cy="60" r="3.5" fill="white" stroke="none" />
                    <circle cx="43" cy="64" r="3.5" fill="white" stroke="none" />
                    <circle cx="50" cy="66" r="3.5" fill="white" stroke="none" />
                    <circle cx="57" cy="64" r="3" fill="white" stroke="none" />
                </g>
            </svg>

            {/* Text wordmark */}
            <div className="flex flex-col leading-tight">
                <span
                    className={`font-extrabold tracking-tight ${textSizes[size].top}`}
                    style={{ color: "#00287a", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
                >
                    mercado
                </span>
                <span
                    className={`font-extrabold tracking-tight ${textSizes[size].bottom}`}
                    style={{ color: "#009ee3", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
                >
                    pago
                </span>
            </div>
        </div>
    );
}

// ─── Pagar.me ───────────────────────────────────────────────────────────────
// Vivid green wordmark with the signature arc swoosh.
export function PagarMeLogo({ size = "md" }: { size?: LogoSize }) {
    const containerSizes: Record<LogoSize, string> = {
        sm: "h-8",
        md: "h-20",
        lg: "h-32",
    };

    const textSizes: Record<LogoSize, string> = {
        sm: "text-base",
        md: "text-3xl",
        lg: "text-5xl",
    };

    const arcSizes: Record<LogoSize, string> = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    return (
        <div
            className={`flex items-center gap-0.5 ${containerSizes[size]}`}
            role="img"
            aria-label="Pagar.me"
        >
            <span
                className={`font-bold ${textSizes[size]}`}
                style={{ color: "#65a300", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
            >
                pagar
            </span>
            <span
                className={`font-light ${textSizes[size]}`}
                style={{ color: "#4a7a00", fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
            >
                .me
            </span>
            {/* Green arc swoosh */}
            <svg
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className={`${arcSizes[size]} -ml-0.5 -mt-3`}
            >
                <defs>
                    <linearGradient id="pagarme-arc" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#65a300" />
                        <stop offset="100%" stopColor="#8ed100" />
                    </linearGradient>
                </defs>
                <path
                    d="M19 12 A7 7 0 0 0 12 5"
                    fill="none"
                    stroke="url(#pagarme-arc)"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                {/* Arrow tip */}
                <polygon points="20,5 19,11 14,8" fill="#8ed100" />
            </svg>
        </div>
    );
}
