import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Triadpay - The Financial Engine",
    description:
        "Premium white-label payment infrastructure for merchants. Seamless split payments, global payouts, and total brand control.",
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* Material Icons */}
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link
                href="https://fonts.googleapis.com/icon?family=Material+Icons"
                rel="stylesheet"
            />
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                rel="stylesheet"
            />
            <div className="bg-background-dark text-white selection:bg-primary selection:text-black antialiased overflow-x-hidden min-h-screen">
                {children}
            </div>
        </>
    );
}
