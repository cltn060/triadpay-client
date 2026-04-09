import type { Metadata } from "next";
import { StoreGate } from "@/components/store/StoreGate";

export const metadata: Metadata = {
    title: "Dashboard | Caruma",
    description: "Caruma Merchant Dashboard - Manage payments, products, and payouts.",
};

export default async function DomainLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ domain: string }>;
}) {
    const { domain } = await params;

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
            <StoreGate domain={domain}>
                {children}
            </StoreGate>
        </>
    );
}
