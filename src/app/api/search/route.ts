import { NextResponse } from "next/server";
import { formatMoneyCompact } from "@/lib/currency";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const q = (url.searchParams.get("q") || "").trim().toLowerCase();

        // Sample dataset — replace with real backend/Convex query when available
        const items = [
            { id: "p_1", name: "Wireless Headphones", priceCents: 2999, href: "/product/1" },
            { id: "p_2", name: "Organic Cotton T-Shirt", priceCents: 2499, href: "/product/2" },
            { id: "p_3", name: "Coffee Subscription", priceCents: 1099, href: "/product/3" },
            { id: "p_4", name: "E-book: Start Selling", priceCents: 999, href: "/product/4" },
        ];

        const filtered = q
            ? items.filter((it) => it.name.toLowerCase().includes(q))
            : [];

        const results = filtered.map((it) => ({
            title: it.name,
            href: it.href,
            price: formatMoneyCompact(it.priceCents, "USD"),
        }));

        return NextResponse.json(results);
    } catch (err) {
        return NextResponse.json([], { status: 500 });
    }
}
