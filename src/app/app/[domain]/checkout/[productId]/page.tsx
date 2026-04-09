"use client";

import { use, Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, LinkAuthenticationElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/providers/theme-provider";
import { LanguageSwitcher } from "@/components/marketing/LanguageSwitcher";
import { useDragScroll } from "@/hooks/useDragScroll";
import { ShieldCheck, RotateCcw, Truck, Headset, Ticket, Timer, type LucideIcon } from "lucide-react";

// ─── Badge Icon Map ─────────────────────────────────────────────────────────
const BADGE_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
    secure_payment: { icon: ShieldCheck, label: "Secure Pay" },
    money_back: { icon: RotateCcw, label: "Money Back" },
    fast_shipping: { icon: Truck, label: "Fast Shipping" },
    "24_7_support": { icon: Headset, label: "24/7 Support" },
};

// ─── MercadoPago.js Types ────────────────────────────────────────────────────
declare global {
    interface Window {
        MercadoPago: any;
    }
}

// ─── Stripe Setup ────────────────────────────────────────────────────────────
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

// ─── Idempotency Key Generator ──────────────────────────────────────────────
/** Generate a deterministic idempotency key per checkout attempt. */
function generateIdempotencyKey(productId: string, attempt: number): string {
    const session = typeof window !== "undefined"
        ? (window as any).__checkoutSession ??= crypto.randomUUID()
        : crypto.randomUUID();
    return `${productId}:${session}:${attempt}`;
}

// ─── Payment Result Screen ──────────────────────────────────────────────────
function PaymentResult({
    status,
    paymentId,
    onReset,
}: {
    status: "success" | "failed" | "pending";
    paymentId?: string;
    onReset: () => void;
}) {
    const config = {
        success: { icon: "check_circle", title: "Payment Successful!", desc: "Your purchase has been confirmed. You'll receive a confirmation email shortly.", color: "#22c55e" },
        failed: { icon: "error", title: "Payment Failed", desc: "There was an issue processing your payment. Please try again.", color: "#ef4444" },
        pending: { icon: "schedule", title: "Payment Processing", desc: "Your payment is being processed. You'll receive a confirmation once approved.", color: "#f59e0b" },
    };
    const c = config[status];
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors flex items-center justify-center font-sans p-6">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <div className="w-full max-w-md text-center bg-white dark:bg-[#141414] transition-colors rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 p-10">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${c.color}15` }}>
                    <span className="material-icons text-5xl" style={{ color: c.color }}>{c.icon}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>{c.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{c.desc}</p>
                {paymentId && <p className="text-gray-400 dark:text-gray-500 text-xs mb-4">Reference: <span className="text-gray-600 dark:text-gray-300 font-mono">{paymentId}</span></p>}
                {status === "failed" && (
                    <button onClick={onReset} className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-all cursor-pointer">
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Shared Submit Button ───────────────────────────────────────────────────
function CheckoutSubmitButton({
    totalDollars,
    isProcessing,
    isDisabled,
    onClick,
}: {
    totalDollars: string;
    isProcessing: boolean;
    isDisabled: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            type={onClick ? "button" : "submit"}
            onClick={onClick}
            disabled={isDisabled || isProcessing}
            className={`w-full font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-base transition-all cursor-pointer ${isDisabled || isProcessing
                ? "bg-gray-300 dark:bg-white/10 text-gray-500 dark:text-gray-500 cursor-not-allowed shadow-none"
                : "bg-primary text-black hover:brightness-110 hover:-translate-y-0.5 shadow-glow hover:shadow-glow-lg"
                }`}
        >
            {isProcessing ? (
                <>
                    <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
                    Processing...
                </>
            ) : (
                <>
                    <span className="material-icons text-lg">lock</span>
                    Pay ${totalDollars}
                </>
            )}
        </button>
    );
}

// ─── Stripe Payment Form (inside Elements context) ──────────────────────────
function StripePaymentForm({
    totalDollars,
    isProcessing,
    setIsProcessing,
    onResult,
    onCommit,
}: {
    totalDollars: string;
    isProcessing: boolean;
    setIsProcessing: (v: boolean) => void;
    onResult: (result: { status: "success" | "failed" | "pending"; paymentId?: string }) => void;
    onCommit: (paymentIntentId: string, email: string) => Promise<void>;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState("");

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements || isProcessing) return;

        setIsProcessing(true);
        setError(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message ?? "An error occurred.");
            setIsProcessing(false);
            return;
        }

        const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href,
                receipt_email: email || undefined,
                payment_method_data: {
                    billing_details: {
                        email: email || undefined,
                    },
                },
            },
            redirect: "if_required",
        });

        if (confirmError) {
            setError(confirmError.message ?? "Payment failed.");
            setIsProcessing(false);
            return;
        }

        if (paymentIntent) {
            // Record the transaction in DB AFTER successful Stripe confirmation
            try {
                await onCommit(paymentIntent.id, email);
            } catch (commitErr) {
                console.error("[checkout] commitCheckout failed (webhook will recover):", commitErr);
            }

            switch (paymentIntent.status) {
                case "succeeded":
                    onResult({ status: "success", paymentId: paymentIntent.id });
                    break;
                case "processing":
                    onResult({ status: "pending", paymentId: paymentIntent.id });
                    break;
                default:
                    onResult({ status: "failed", paymentId: paymentIntent.id });
                    break;
            }
        }
    }, [stripe, elements, isProcessing, setIsProcessing, onResult, onCommit, email]);

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Payment Details</h3>
            <LinkAuthenticationElement
                onChange={(e) => setEmail(e.value.email)}
            />
            <PaymentElement options={{ layout: "tabs" }} />
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs mt-2 mb-2">
                    <span className="material-icons text-sm">warning</span>
                    {error}
                </div>
            )}
            <CheckoutSubmitButton
                totalDollars={totalDollars}
                isProcessing={isProcessing}
                isDisabled={!stripe}
            />
        </form>
    );
}

// ─── Main Checkout Content ──────────────────────────────────────────────────
function CheckoutContent({ productId }: { productId: string }) {
    const searchParams = useSearchParams();
    const ref = searchParams.get("ref");
    const variantSlug = searchParams.get("v") || searchParams.get("variant");
    const { theme } = useTheme();

    const product = useQuery(api.products.getProductForCheckout, { productId: productId as Id<"products"> });
    const checkoutConfig = useQuery(api.checkoutConfig.getCheckoutConfigForProduct, { productId: productId as Id<"products"> });
    const activePsp = useQuery(api.paymentsHelpers.getCheckoutPspForProduct, { productId: productId as Id<"products"> }) as "STRIPE" | "MERCADO_PAGO" | null | undefined;

    // ─── Two-Phase Checkout Actions ──────────────────────────────
    const recordVisit = useMutation(api.affiliates.recordVisit);
    const prepareCheckout = useAction(api.checkoutActions.prepareCheckout);
    const commitCheckout = useAction(api.checkoutActions.commitCheckout);

    // State
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
    const { scrollRef, hasDragged, events } = useDragScroll();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentResult, setPaymentResult] = useState<{ status: "success" | "failed" | "pending"; paymentId?: string } | null>(null);
    const [submitAttempt, setSubmitAttempt] = useState(0);

    // ─── NEW: Complexity Additions ──────────────────────────────────────────
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes urgency timer
    const [couponCode, setCouponCode] = useState("");
    const [isCouponApplied, setIsCouponApplied] = useState(false);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleApplyCoupon = () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        // Simulate API call to validate coupon
        setTimeout(() => {
            if (couponCode.toUpperCase() === "TRIAD10") {
                const basePrice = product?.price || 0;
                setDiscountAmount(basePrice * 0.1);
                setIsCouponApplied(true);
                setError(null);
            } else {
                setError("Invalid coupon code. Try 'TRIAD10'");
                setIsCouponApplied(false);
            }
            setIsApplyingCoupon(false);
        }, 800);
    };

    const priceDollars = product ? product.price.toFixed(2) : "0.00";
    const totalDollarsDisplay = Math.max(0, Number(priceDollars) - discountAmount).toFixed(2);
    // ───────────────────────────────────────────────────────────────────────

    // Stripe client secret (created on mount for Stripe checkouts)
    const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
    // Stripe PaymentIntent ID + externalReference from prepareCheckout
    const [stripePrepareData, setStripePrepareData] = useState<{ pspPaymentId: string; externalReference: string } | null>(null);

    // MercadoPago.js state
    const [mpReady, setMpReady] = useState(false);
    const cardFormRef = useRef<any>(null);
    const cardFormInitializing = useRef(false);

    // ─── Record visit on mount (fire & forget) ──────────────────
    useEffect(() => {
        if (!product) return;
        recordVisit({
            productId: productId as Id<"products">,
            affiliateId: ref ? (ref as Id<"users">) : undefined,
            variantSlug: variantSlug ?? undefined,
        }).catch(() => { }); // silent fail
    }, [product, productId, ref, variantSlug, recordVisit]);

    // ─── Stripe: Call prepareCheckout on mount → get clientSecret (NO DB write) ──
    useEffect(() => {
        if (activePsp !== "STRIPE" || !product || stripeClientSecret) return;

        prepareCheckout({
            productId: productId as Id<"products">,
            affiliateId: ref ? (ref as Id<"users">) : undefined,
            variantSlug: variantSlug ?? undefined,
        })
            .then((result: any) => {
                if (result.psp === "STRIPE" && result.clientSecret) {
                    setStripeClientSecret(result.clientSecret);
                    setStripePrepareData({
                        pspPaymentId: result.pspPaymentId,
                        externalReference: result.externalReference,
                    });
                } else {
                    setError("Unexpected response from payment provider.");
                }
            })
            .catch((err: any) => {
                console.error("[checkout] Failed to initialize Stripe:", err);
                setError("Unable to initialize payment. Please try again.");
            });
    }, [activePsp, product, productId, ref, variantSlug, prepareCheckout, stripeClientSecret]);

    // ─── MP: Load SDK ────────────────────────────────────────────
    useEffect(() => {
        if (activePsp !== "MERCADO_PAGO") return;
        if (typeof window === "undefined") return;
        if (window.MercadoPago) { setMpReady(true); return; }
        const script = document.createElement("script");
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.async = true;
        script.onload = () => setMpReady(true);
        document.body.appendChild(script);
    }, [activePsp]);

    // ─── MP: Init CardForm ───────────────────────────────────────
    useEffect(() => {
        if (activePsp !== "MERCADO_PAGO" || !mpReady || !product || cardFormRef.current || cardFormInitializing.current) return;
        cardFormInitializing.current = true;
        const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
        if (!publicKey) { setError("Payment configuration error."); cardFormInitializing.current = false; return; }

        try {
            const mp = new window.MercadoPago(publicKey, { locale: "es-AR" });

            const fieldStyle = {
                fontSize: "14px",
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                color: theme === "dark" ? "#ffffff" : "#111827",
                placeholderColor: theme === "dark" ? "#6b7280" : "#9ca3af",
            };

            const form = mp.cardForm({
                amount: String(product.price.toFixed(2)),
                iframe: true,
                form: {
                    id: "checkout-form",
                    cardNumber: { id: "mp-card-number", placeholder: "0000 0000 0000 0000", style: fieldStyle },
                    expirationDate: { id: "mp-expiration", placeholder: "MM/YY", style: fieldStyle },
                    securityCode: { id: "mp-cvc", placeholder: "CVC", style: fieldStyle },
                    cardholderName: { id: "mp-cardholder" },
                    cardholderEmail: { id: "mp-email" },
                    installments: { id: "mp-installments" },
                    issuer: { id: "mp-issuer" },
                },
                callbacks: {
                    onFormMounted: (err: any) => {
                        if (err) console.error("[mp] Form mount error:", err);
                    },
                    onSubmit: () => { },
                    onFetching: () => { },
                },
            });
            cardFormRef.current = form;
        } catch (err) {
            console.error("[mp] CardForm init error:", JSON.stringify(err));
            setError("Failed to initialize payment form.");
            cardFormInitializing.current = false;
        }
        return () => {
            if (cardFormRef.current) {
                try { cardFormRef.current.unmount(); } catch (e) { /* ignore */ }
                cardFormRef.current = null;
                cardFormInitializing.current = false;
            }
        };
    }, [activePsp, mpReady, product, theme]);

    // ─── MP: Handle Payment (calls commitCheckout) ──────────────
    const handleMPPayment = useCallback(async () => {
        const form = cardFormRef.current;
        if (!form || !product || isProcessing) return;
        setIsProcessing(true);
        setError(null);
        try {
            const emailInput = document.getElementById("mp-email") as HTMLInputElement | null;
            const email = emailInput?.value?.trim() || "";
            if (!email || !email.includes("@")) {
                setError("Please enter a valid email address.");
                setIsProcessing(false);
                return;
            }

            await form.createCardToken();
            const cardFormData = form.getCardFormData();
            if (!cardFormData.token) {
                setError("Unable to process card details. Please check your information.");
                setIsProcessing(false);
                return;
            }

            // Generate idempotency key for this specific attempt
            const nextAttempt = submitAttempt + 1;
            setSubmitAttempt(nextAttempt);
            const idempotencyKey = generateIdempotencyKey(productId, nextAttempt);

            // Call commitCheckout (writes transaction + charges MP)
            const result = await commitCheckout({
                productId: productId as Id<"products">,
                customerEmail: cardFormData.cardholderEmail || email,
                paymentToken: cardFormData.token,
                paymentMethodId: cardFormData.paymentMethodId || "visa",
                installments: cardFormData.installments ? Number(cardFormData.installments) : 1,
                idempotencyKey,
                affiliateId: ref ? (ref as Id<"users">) : undefined,
                variantSlug: variantSlug ?? undefined,
            });

            // Handle the response
            const r = result as any;
            if (r.type === "SUCCESS") {
                setPaymentResult({ status: "success", paymentId: r.pspPaymentId });
            } else if (r.type === "PENDING") {
                setPaymentResult({ status: "pending", paymentId: r.pspPaymentId });
            } else if (r.type === "REDIRECT" && r.url) {
                window.location.href = r.url;
            } else {
                setPaymentResult({ status: "failed", paymentId: r.pspPaymentId });
            }
        } catch (err: any) {
            console.error("[checkout] Payment error:", err);
            setError(err.message || "An unexpected error occurred.");
            setIsProcessing(false);
        }
    }, [product, isProcessing, commitCheckout, productId, ref, variantSlug, submitAttempt]);

    // Loading
    if (product === undefined || activePsp === undefined) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-white/10 border-t-gray-600 dark:border-t-white animate-spin"></div>
                    <span className="text-sm font-medium text-gray-400 dark:text-gray-500">Loading checkout...</span>
                </div>
            </div>
        );
    }

    // Not found
    if (product === null) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors flex items-center justify-center font-sans">
                <div className="text-center bg-white dark:bg-[#141414] transition-colors rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-12">
                    <span className="material-icons text-5xl text-gray-300 dark:text-white/20 mb-4 block">error_outline</span>
                    <h1 className="text-gray-900 dark:text-white text-2xl font-bold mb-2">Product Not Found</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">This product is unavailable or has been removed.</p>
                </div>
            </div>
        );
    }

    // No PSP configured
    if (activePsp === null) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors flex items-center justify-center font-sans">
                <div className="text-center bg-white dark:bg-[#141414] transition-colors rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-12">
                    <span className="material-icons text-5xl text-amber-300 dark:text-amber-500/50 mb-4 block">payment</span>
                    <h1 className="text-gray-900 dark:text-white text-2xl font-bold mb-2">Payments Not Configured</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">The seller has not configured a payment provider yet.</p>
                </div>
            </div>
        );
    }

    // Payment result
    if (paymentResult) {
        return <PaymentResult status={paymentResult.status} paymentId={paymentResult.paymentId} onReset={() => { setPaymentResult(null); setIsProcessing(false); setSubmitAttempt(0); }} />;
    }

    const badges = checkoutConfig?.trustBadgesEnabled && checkoutConfig.trustBadges ? checkoutConfig.trustBadges : [];

    const themeColor = (product as any).themeColor ?? "#0df20d";
    const hex = themeColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 13;
    const g = parseInt(hex.substring(2, 4), 16) || 242;
    const b = parseInt(hex.substring(4, 6), 16) || 13;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
            <style dangerouslySetInnerHTML={{ __html: `:root { --primary: ${themeColor}; --color-primary-rgb: ${r}, ${g}, ${b}; }` }} />
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            {activePsp === "MERCADO_PAGO" && (
                <style>{`
                    .mp-field {
                        height: 44px;
                        position: relative;
                        overflow: visible;
                    }
                    .mp-field > iframe {
                        display: block !important;
                        position: relative !important;
                        z-index: 1 !important;
                        height: 100% !important;
                        min-height: 44px !important;
                        width: 100% !important;
                        border: none !important;
                    }
                `}</style>
            )}

            {/* ─── Top Navbar ─── */}
            <nav className="w-full border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] transition-colors sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center overflow-hidden flex-shrink-0 ${(product as any).storeLogoUrl
                                ? (product as any).storeLogoHasWhiteBg ? "bg-white border border-gray-200 dark:border-white/10" : "bg-transparent"
                                : "bg-gray-900 dark:bg-white"
                            }`}>
                            {(product as any).storeLogoUrl ? (
                                <img
                                    src={(product as any).storeLogoUrl}
                                    alt={product.storeName}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <span className="material-icons text-white dark:text-gray-900 text-base">storefront</span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white transition-colors leading-tight">
                                {product.storeName}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wide">
                                caruma.com
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher variant="checkout" />
                        <ThemeToggle />
                    </div>
                </div>
            </nav>

            {/* ─── Urgency Timer Banner ─── */}
            <div className="w-full bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/20 py-2 px-4 transition-colors">
                <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 text-[11px] font-bold text-amber-700 dark:text-amber-500/80 uppercase tracking-widest">
                    <Timer className="w-3.5 h-3.5" />
                    <span>Special Offer Ends In: <span className="text-amber-900 dark:text-amber-400 font-mono text-xs">{formatTime(timeLeft)}</span></span>
                </div>
            </div>

            <main className="w-full max-w-5xl mx-auto px-4 py-10 md:py-16">


                {/* ─── Grid Layout ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 items-start mt-8">

                    {/* ─── Left Column: Product & Trust ─── */}
                    <div className="flex flex-col gap-8 order-2 lg:order-1 mt-10 lg:mt-0">
                        {/* ─── Product Card & Gallery ─── */}
                        <div className="bg-white dark:bg-[#141414] transition-colors rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-primary/5 border border-gray-200 hover:border-gray-300 dark:border-primary/10 dark:hover:border-primary/30 p-6 md:p-8 relative overflow-hidden group duration-500">

                            {/* ─── Persistent Order Summary (NEW) ─── */}
                            <div className="mb-8 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 space-y-3">
                                <div className="flex justify-between text-xs font-semibold title-font uppercase tracking-wider text-gray-500">
                                    <span>Summary</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                                    <span className="text-gray-900 dark:text-white font-medium">${priceDollars}</span>
                                </div>
                                {isCouponApplied && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-primary font-medium">Discount (10%)</span>
                                        <span className="text-primary font-medium">-${discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-between items-center text-xl font-black">
                                    <span className="text-gray-900 dark:text-white">Total</span>
                                    <span className="text-gray-900 dark:text-white transform transition-all hover:scale-105">${totalDollarsDisplay}</span>
                                </div>
                            </div>

                            <div className="absolute top-0 right-0 w-64 h-64 opacity-0 dark:opacity-100 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary/10 transition-colors pointer-events-none" />
                            {/* Gallery section */}
                            {(product.coverImageUrl || (product.mediaUrls && product.mediaUrls.length > 0)) && (
                                <div className="mb-6 flex flex-col gap-4 -mt-6 -mx-6">
                                    <div
                                        onClick={() => {
                                            const allImages = [product.coverImageUrl, ...(product.mediaUrls || [])].filter(Boolean);
                                            if (allImages.length > 0) {
                                                setActiveImageIndex((prev) => (prev + 1) % allImages.length);
                                            }
                                        }}
                                        className="w-full aspect-square bg-gray-50 dark:bg-[#121212] border-b border-gray-100 dark:border-white/5 overflow-hidden flex items-center justify-center relative transition-colors group cursor-pointer"
                                    >
                                        {(() => {
                                            const allImages = [product.coverImageUrl, ...(product.mediaUrls || [])].filter(Boolean);
                                            const currentImg = allImages[activeImageIndex];
                                            if (currentImg) {
                                                return <img src={currentImg as string} alt={product.name} className="w-full h-full object-cover transition-all" />;
                                            }
                                            return <span className="material-icons text-6xl text-gray-300 dark:text-white/20 transition-colors">inventory_2</span>;
                                        })()}
                                    </div>

                                    {/* Thumbnails */}
                                    {product.mediaUrls && product.mediaUrls.length > 0 && (
                                        <div
                                            ref={scrollRef}
                                            {...events}
                                            className="flex gap-2 px-6 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                                        >
                                            {[product.coverImageUrl, ...product.mediaUrls].filter(Boolean).map((url, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (!hasDragged) setActiveImageIndex(idx);
                                                    }}
                                                    className={`w-16 h-16 bg-white dark:bg-transparent rounded-lg overflow-hidden flex-shrink-0 transition-all cursor-pointer border-2 focus:outline-none focus:ring-2 focus:ring-primary/20 ${activeImageIndex === idx ? "border-primary shadow-sm" : "border-gray-100 dark:border-white/10 opacity-60 hover:opacity-100 hover:border-gray-300 dark:hover:border-white/50"}`}
                                                >
                                                    <img src={url as string} alt={`Thumb ${idx}`} className="w-full h-full object-cover transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Product TopLevel Info */}
                            <div className="flex flex-col gap-3">
                                <h3 className="font-bold text-gray-900 dark:text-white text-2xl transition-colors">{product.name}</h3>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">${priceDollars}</div>
                                {product.description && <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap leading-relaxed mt-2 transition-colors">{product.description}</p>}
                            </div>
                        </div>

                        {/* ─── Trust Badges (Left Column) ─── */}
                        {badges.length > 0 && (
                            <div className="flex flex-col gap-4 pl-2">
                                <div className="flex gap-6">
                                    {badges.map((key) => {
                                        const badge = BADGE_ICONS[key];
                                        if (!badge) return null;
                                        const Icon = badge.icon;
                                        return (
                                            <div key={key} className="flex flex-col gap-1.5 items-start">
                                                <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400 transition-colors" strokeWidth={1.5} />
                                                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 transition-colors uppercase tracking-wider">{badge.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ─── Right Column: Payment Form ─── */}
                    <div className="order-1 lg:order-2 space-y-6">

                        {/* Shared Promo Code Section */}
                        <div className="p-6 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm space-y-4">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Ticket className="w-3.5 h-3.5" />
                                Promotional Offer
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter Code"
                                    disabled={isCouponApplied}
                                    className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-sm py-3 px-4 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyCoupon}
                                    disabled={isCouponApplied || isApplyingCoupon || !couponCode}
                                    className={`px-5 py-3 rounded-xl text-xs font-bold transition-all uppercase flex items-center justify-center min-w-[90px] ${isCouponApplied ? "bg-green-500 text-white" : "bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90"}`}
                                >
                                    {isApplyingCoupon ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white dark:border-black/20 dark:border-t-black rounded-full animate-spin"></div>
                                    ) : isCouponApplied ? "Applied" : "Apply"}
                                </button>
                            </div>
                        </div>

                        {/* Payment Elements */}
                        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-primary/5 border border-gray-200 hover:border-gray-300 dark:border-primary/10 dark:hover:border-primary/30 transition-colors relative overflow-hidden group duration-500">
                            <div className="absolute top-0 right-0 w-64 h-64 opacity-0 dark:opacity-100 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary/10 transition-colors pointer-events-none" />
                            {activePsp === "STRIPE" && stripeClientSecret && stripePromise ? (
                                <Elements
                                    stripe={stripePromise}
                                    options={{
                                        clientSecret: stripeClientSecret,
                                        appearance: {
                                            theme: theme === "dark" ? "night" : "stripe",
                                            variables: {
                                                colorPrimary: theme === "dark" ? "#ffffff" : "#111827",
                                                colorBackground: theme === "dark" ? "#1a1a1a" : "#ffffff",
                                                colorText: theme === "dark" ? "#ffffff" : "#111827",
                                                colorIconTab: theme === "dark" ? "#9ca3af" : "#6b7280",
                                                colorIconTabSelected: theme === "dark" ? "#ffffff" : "#111827",
                                                fontFamily: "'Inter', system-ui, sans-serif",
                                                borderRadius: "12px",
                                            },
                                            rules: {
                                                '.Input': {
                                                    padding: '12px 16px',
                                                },
                                                '.Tab:hover': {
                                                    color: theme === "dark" ? "#ffffff" : "#111827",
                                                },
                                                '.Tab--selected': {
                                                    backgroundColor: theme === "dark" ? "#2a2a2a" : "#ffffff",
                                                    color: theme === "dark" ? "#ffffff" : "#111827",
                                                    borderColor: theme === "dark" ? "#3a3a3a" : "transparent"
                                                },
                                                '.Tab--selected:hover': {
                                                    backgroundColor: theme === "dark" ? "#2a2a2a" : "#ffffff",
                                                    color: theme === "dark" ? "#ffffff" : "#111827",
                                                }
                                            }
                                        },
                                    }}
                                >
                                    <StripePaymentForm
                                        totalDollars={totalDollarsDisplay}
                                        isProcessing={isProcessing}
                                        setIsProcessing={setIsProcessing}
                                        onResult={setPaymentResult}
                                        onCommit={async (paymentIntentId, email) => {
                                            await commitCheckout({
                                                productId: productId as Id<"products">,
                                                customerEmail: email || undefined,
                                                affiliateId: ref ? (ref as Id<"users">) : undefined,
                                                variantSlug: variantSlug ?? undefined,
                                                stripePaymentIntentId: paymentIntentId,
                                                stripeExternalReference: stripePrepareData?.externalReference,
                                            });
                                        }}
                                    />
                                </Elements>
                            ) : activePsp === "STRIPE" ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-pulse flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin"></div>
                                        <span className="text-sm text-gray-400">Initializing payment...</span>
                                    </div>
                                </div>
                            ) : activePsp === "MERCADO_PAGO" ? (
                                <div className="space-y-6">
                                    <form id="checkout-form" onSubmit={(e) => { e.preventDefault(); handleMPPayment(); }} className="space-y-5">
                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Email Address</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="material-icons text-gray-400 dark:text-gray-500 transition-colors text-[20px]">mail</span>
                                                </div>
                                                <input
                                                    id="mp-email"
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    className="block w-full pl-10 bg-white dark:bg-[#141414] border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/20 focus:border-gray-400 dark:focus:border-white/20 text-sm py-3 outline-none transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* Card Fields */}
                                        <div className="space-y-1.5 mt-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Card Information</label>
                                            <div id="mp-card-number" className="mp-field w-full bg-white dark:bg-[#141414] border border-gray-300 dark:border-white/10 rounded-t-lg px-4 transition-colors"></div>
                                            <div className="flex -mt-[1px]">
                                                <div id="mp-expiration" className="mp-field w-1/2 bg-white dark:bg-[#141414] border border-gray-300 dark:border-white/10 rounded-bl-lg px-4 border-t-0 border-r-0 transition-colors"></div>
                                                <div id="mp-cvc" className="mp-field w-1/2 bg-white dark:bg-[#141414] border border-gray-300 dark:border-white/10 rounded-br-lg px-4 border-t-0 transition-colors"></div>
                                            </div>
                                        </div>

                                        {/* Name on Card */}
                                        <div className="space-y-1.5 mt-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Name on Card</label>
                                            <input
                                                id="mp-cardholder"
                                                type="text"
                                                placeholder="Full Name"
                                                className="block w-full bg-white dark:bg-[#141414] border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/20 focus:border-gray-400 dark:focus:border-white/20 text-sm py-3 px-4 outline-none transition-colors"
                                            />
                                        </div>
                                    </form>

                                    {/* Error display */}
                                    {error && (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs mt-2 transition-colors">
                                            <span className="material-icons text-sm">warning</span>
                                            {error}
                                        </div>
                                    )}

                                    {/* ─── Mercado Pago Custom CTA Button ─── */}
                                    <div className="mt-4">
                                        <CheckoutSubmitButton
                                            totalDollars={totalDollarsDisplay}
                                            isProcessing={isProcessing}
                                            isDisabled={!mpReady}
                                            onClick={handleMPPayment}
                                        />
                                    </div>

                                    {/* Hidden MP fields */}
                                    <select id="mp-installments" className="hidden"></select>
                                    <select id="mp-issuer" className="hidden"></select>
                                    {ref && <input type="hidden" name="affiliateRef" value={ref} />}
                                </div>
                            ) : null}


                        </div>
                    </div>
                </div>

                {/* ─── Footer ─── */}
                <div className="mt-10 pt-6 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 dark:text-gray-500 transition-colors">
                    <p>Secured by <span className="text-gray-600 dark:text-gray-400 font-bold">{activePsp === "STRIPE" ? "Stripe" : activePsp === "MERCADO_PAGO" ? "Mercado Pago" : "Caruma"}</span></p>
                    <span className="flex items-center gap-1"><span className="material-icons text-[14px]">lock</span> SSL Encrypted</span>
                </div>
            </main>
        </div>
    );
}

export default function CheckoutPage({
    params,
}: {
    params: Promise<{ productId: string }>;
}) {
    const resolvedParams = use(params);
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        }>
            <CheckoutContent productId={resolvedParams.productId} />
        </Suspense>
    );
}
