import Image from "next/image";

type StockStatus = "In Stock" | "Low Stock" | "Critical" | "Active" | "Unlimited";

interface Product {
    name: string;
    description: string;
    price: string;
    priceSuffix?: string;
    image?: string;
    icon?: string;
    badge: string;
    status: StockStatus;
    stockLabel: string;
    stockValue: string;
    stockPercent: number;
}

const statusStyles: Record<StockStatus, string> = {
    "In Stock": "text-primary bg-primary/10 border-primary/20",
    "Low Stock": "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    "Critical": "text-red-500 bg-red-500/10 border-red-500/20",
    "Active": "text-white bg-white/10 border-white/20",
    "Unlimited": "text-white bg-white/10 border-white/20",
};

const stockBarColors: Record<StockStatus, string> = {
    "In Stock": "bg-primary",
    "Low Stock": "bg-yellow-500",
    "Critical": "bg-red-500",
    "Active": "bg-white/50",
    "Unlimited": "bg-white/50",
};

export const products: Product[] = [
    {
        name: "Quantum Watch Series X",
        description:
            "Premium titanium chassis with advanced biometric tracking sensors.",
        price: "$499.00",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn1A_50Y3fvXEQwjqpHuiuSjdrVIMXzc9zuTx2px-fDEIbi4uItWREoNHo3a8jKvTQshMdjjh5WuXoUfiOiCaIsiLPfdHmRMcQpv8uDtqxwlLoFWY3WozxM7MrsQn8zN7_imgsEnnB79QLNC0_TkGxR3ds06D0VdVAHhCB25P9QpE3LBtiNJsaH_xYjN3fb3alHcw2E-o_YA1FjaHPyRQ2JcjBptefMFwGN7ZBXPraMMQh3j5G1jz0bHpfde6DmvS4PBAVGaIXccA",
        badge: "Physical",
        status: "In Stock",
        stockLabel: "Stock Level",
        stockValue: "142/200",
        stockPercent: 71,
    },
    {
        name: "Nike Air Max Red",
        description:
            "Limited edition sneakers with adaptive cushioning technology.",
        price: "$189.99",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzTXf1y1coppERODETUyLQKPMynFTwxYx98AtdLxFYjuMxVjAhla8p5Zt5uLlqxTDJpJ27cdvRuKdSEjkKHKat4AMd0FZt5iCkYWbPCfkD6wZUN9mRIqNUqMVD7Nr89TiR4kfF0FCnDEbolIXnJe7gQj1pPRF1aa7veETRJ2WtLuZy2_4mCjVpLiwECuo7wHuzHzXAn-R7TaE7evqPTft5Za-F9lnGGCXZY83-w2lYsdh41_MbyMZgbXRXUkmm8vn_wpu1OY3tS6U",
        badge: "Physical",
        status: "Low Stock",
        stockLabel: "Stock Level",
        stockValue: "12/100",
        stockPercent: 12,
    },
    {
        name: "Pro Developer Plan",
        description:
            "Unlimited API access, priority support, and advanced analytics dashboard.",
        price: "$29.00",
        priceSuffix: "/mo",
        icon: "card_membership",
        badge: "Subscription",
        status: "Active",
        stockLabel: "Active Users",
        stockValue: "8,420",
        stockPercent: 100,
    },
    {
        name: "Sonic Bass Headphones",
        description:
            "Noise-cancelling over-ear headphones with 40h battery life.",
        price: "$249.00",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrYWbTZWquAxP-ywRuY4ZjitGktqcdVU1evIreC-PZhLwjR1cP6yWiLwyDJ9wbHpUoO2iogsjaEGiWFXJs0949cUfqEfpllr8UoW5BLVrStwOPvN5cqhNr_OgxvA2EKJGIOb2nCoAKMfnb1R0suFBNV89tncm42BKZ2SuCzNghC7_TMpCGyFtdmvnTzs9mys7ZS8J_uPwXUxzKDN5Zb3xSvPS4npj7e2tC-1YuCIkm9rE88Pr7GwgyBgjhMYUgdjIQKzNn_rmpYt0",
        badge: "Physical",
        status: "In Stock",
        stockLabel: "Stock Level",
        stockValue: "89/100",
        stockPercent: 89,
    },
    {
        name: "UI Design Kit v3.0",
        description:
            "Complete design system for Figma including 500+ components.",
        price: "$89.00",
        icon: "download",
        badge: "Digital",
        status: "Unlimited",
        stockLabel: "Downloads",
        stockValue: "1,245",
        stockPercent: 100,
    },
    {
        name: "Mechanical Keycaps Set",
        description: "Double-shot PBT keycaps with custom legend font.",
        price: "$45.00",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOUJ4CSbnw-OhzpMyU8tzfU1BZ7CTSDat9IwjHF8vyoEQ5053hyxBYOHQuweSW6XBDlfmMxUh06DV6X4-zrg6XUqbLkZ6DeaK6VVHxs-ytjBTtKYNX2UOX5CSZ-8dmUaKnFCDh-YSS4WZLVFa2PXmaF2O2dJIei1G1A9nNOtNaucnf7elQH8FkKwFSnoYKIRyb3NQ9lWFmgvaYKEWupExvv7zXa8zaqYUZBYYlx9rZ_clbidgeXFtfGZ4sk7ye4QAnaIXDYivKSW0",
        badge: "Physical",
        status: "Critical",
        stockLabel: "Stock Level",
        stockValue: "3/50",
        stockPercent: 6,
    },
];

export function ProductCard({ product }: { product: Product }) {
    return (
        <div className="group bg-surface-dark border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-300 flex flex-col h-full">
            {/* Image / Icon */}
            <div className="relative w-full aspect-[4/3] bg-white/5 rounded-xl mb-4 overflow-hidden group-hover:bg-white/10 transition-colors flex items-center justify-center">
                {product.image ? (
                    <Image
                        alt={product.name}
                        className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500"
                        src={product.image}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                ) : (
                    <span className="material-icons text-6xl text-white/20 group-hover:text-white/40 transition-colors">
                        {product.icon}
                    </span>
                )}
                <div className="absolute top-3 right-3">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2 py-1 rounded border border-white/10">
                        {product.badge}
                    </span>
                </div>
            </div>

            {/* Title & Menu */}
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                    {product.name}
                </h3>
                <button className="text-text-grey hover:text-white transition-colors cursor-pointer">
                    <span className="material-icons text-[20px]">
                        more_vert
                    </span>
                </button>
            </div>

            {/* Description */}
            <p className="text-text-grey text-xs mb-4 line-clamp-2">
                {product.description}
            </p>

            {/* Price, Status, Stock */}
            <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xl font-mono text-white font-bold">
                        {product.price}
                        {product.priceSuffix && (
                            <span className="text-sm text-text-grey font-sans font-normal">
                                {product.priceSuffix}
                            </span>
                        )}
                    </span>
                    <span
                        className={`text-xs px-2 py-1 rounded border font-medium ${statusStyles[product.status]}`}
                    >
                        {product.status}
                    </span>
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-text-grey">
                            {product.stockLabel}
                        </span>
                        <span className="text-white font-mono">
                            {product.stockValue}
                        </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5">
                        <div
                            className={`${stockBarColors[product.status]} h-1.5 rounded-full`}
                            style={{ width: `${product.stockPercent}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AddProductCard() {
    return (
        <div className="group border border-dashed border-white/10 hover:border-primary/50 hover:bg-white/[0.02] rounded-2xl p-5 transition-all duration-300 flex flex-col h-full items-center justify-center cursor-pointer min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center mb-4 group-hover:border-primary/50 transition-colors shadow-lg">
                <span className="material-icons text-3xl text-white/50 group-hover:text-primary transition-colors">
                    add
                </span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">
                Add New Product
            </h3>
            <p className="text-text-grey text-xs text-center">
                Create a new item in your inventory
            </p>
        </div>
    );
}
