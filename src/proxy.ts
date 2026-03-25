import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Subdomains reserved for platform infrastructure — never routed as tenant stores.
// This is a lightweight subset for the middleware hot path; the full list lives in
// convex/reservedSlugs.ts and is enforced at store-creation time.
const INFRA_SUBDOMAINS = new Set([
    // Platform routing
    "admin", "app", "api", "www",
    // Auth (Clerk uses accounts.{domain})
    "accounts", "clerk", "auth", "login", "sso", "oauth",
    // Email
    "mail", "smtp", "pop", "pop3", "imap", "webmail", "email",
    // DNS / networking
    "ns", "ns1", "ns2", "ns3", "ns4", "dns", "mx", "autoconfig", "autodiscover",
    // Infrastructure
    "cdn", "static", "assets", "media", "ftp",
    // Environments
    "dev", "staging", "stage", "test", "preview", "sandbox", "demo", "beta", "local", "localhost",
    // Monitoring / DevOps
    "monitoring", "grafana", "metrics", "logs", "ci", "deploy", "git",
    // Security
    "abuse", "security", "postmaster", "webmaster",
    // Brand
    "triadpay", "triadpad", "caruma", "default",
]);

// Routes that do NOT require authentication
const isPublicRoute = createRouteMatcher([
    "/",
    "/affiliates(.*)",
    "/affiliates",
    "/checkout(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/api/mp-oauth(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    const url = req.nextUrl;
    let hostname = req.headers.get("host") || "";
    hostname = hostname.startsWith("www.") ? hostname.replace("www.", "") : hostname;

    console.log(`[proxy] ${req.method} ${hostname}${url.pathname} | public=${isPublicRoute(req)}`);

    // ── Step 1: Authentication Gate ──────────────────────────────────
    if (!isPublicRoute(req)) {
        await auth.protect();
    }

    // ── Step 1.5: API routes always pass through (no rewrite) ────────
    if (url.pathname.startsWith("/api/")) {
        console.log(`[proxy] API route → pass through`);
        return NextResponse.next();
    }

    // ── Step 2: Root Domain → Let Next.js handle natively ───────────
    // On the root domain, Next.js can resolve routes directly from:
    //   src/app/(marketing)/...   for public pages like /affiliates
    //   src/app/sign-up/...       for auth pages
    //   src/app/onboarding/...    for onboarding
    // No rewrite needed.
    const isMultiTenant = process.env.NEXT_PUBLIC_MULTI_TENANT === "true";
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const allowedBaseDomains = ["localhost:3000", rootDomain];
    const isRootDomain = allowedBaseDomains.includes(hostname);

    if (isRootDomain) {
        if (isPublicRoute(req)) {
            // Some public routes live inside app/[domain]/ (e.g. /checkout)
            // These need to be rewritten, not passed through
            const appLevelPublicPrefixes = ["/checkout"];
            const needsRewrite = appLevelPublicPrefixes.some((p) => url.pathname.startsWith(p));

            if (needsRewrite) {
                console.log(`[proxy] root domain, public app-level route → rewriting to /app/default${url.pathname}`);
                return NextResponse.rewrite(
                    new URL(`/app/default${url.pathname}${url.search}`, req.url)
                );
            }

            // Marketing-level public pages: let Next.js resolve natively
            // e.g. /affiliates → src/app/(marketing)/affiliates/page.tsx
            console.log(`[proxy] root domain, public route → pass through`);
            return NextResponse.next();
        }
        // Root-level protected pages that live OUTSIDE /app/[domain]/
        // e.g. /onboarding → src/app/onboarding/page.tsx (not in tenant scope)
        const rootLevelProtectedPrefixes = ["/onboarding", "/redirect"];
        const isRootLevel = rootLevelProtectedPrefixes.some((p) => url.pathname.startsWith(p));

        if (isRootLevel) {
            console.log(`[proxy] root domain, root-level protected → pass through`);
            return NextResponse.next();
        }

        // In multi-tenant mode, no authenticated user should access protected routes
        // on the root domain — they must use their subdomain (e.g. slug.triadpay.tech).
        // Redirect them to the root, which will route them to onboarding or their subdomain.
        if (isMultiTenant && url.pathname !== "/") {
            console.log(`[proxy] root domain, protected route in multi-tenant → redirecting to /`);
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Protected pages on root domain (single-tenant or root "/"): rewrite into /app/default/
        // e.g. /dashboard → src/app/app/[domain="default"]/dashboard/page.tsx
        console.log(`[proxy] root domain, protected → rewriting to /app/default${url.pathname}`);
        return NextResponse.rewrite(
            new URL(`/app/default${url.pathname}${url.search}`, req.url)
        );
    }

    // ── Step 2.5: Admin Subdomain ────────────────────────────────────
    const domainParam = hostname.split(".")[0];
    if (domainParam === "admin") {
        // Admin panel lives at /app/admin/* — separate from tenant routes
        console.log(`[proxy] admin subdomain → rewriting to /app/admin${url.pathname}`);
        return NextResponse.rewrite(
            new URL(`/app/admin${url.pathname}${url.search}`, req.url)
        );
    }

    // ── Step 2.6: Block reserved infrastructure subdomains ──────────
    if (INFRA_SUBDOMAINS.has(domainParam)) {
        console.log(`[proxy] reserved subdomain "${domainParam}" → redirecting to root domain`);
        return NextResponse.redirect(new URL(`https://${rootDomain}`));
    }

    // ── Step 3: Subdomain → Only auth pages pass through to root-level ──
    // /sign-up and /sign-in exist at root level (src/app/sign-up/, src/app/sign-in/)
    // and must pass through so sellers/affiliates can register on store subdomains.
    // Everything else (including "/", "/checkout", "/affiliates") MUST be rewritten
    // into /app/[domain]/ so that StoreGate validates the store exists.
    if (isPublicRoute(req)) {
        const rootLevelAuthPrefixes = ["/sign-up", "/sign-in"];
        const isAuthRoute = rootLevelAuthPrefixes.some((p) => url.pathname.startsWith(p));

        if (isAuthRoute) {
            console.log(`[proxy] subdomain, auth route → pass through to root-level handler`);
            return NextResponse.next();
        }
        // Fall through — rewrite to tenant scope like any other route
    }

    // ── Step 4: Subdomain → Rewrite ALL routes into /app/[domain]/... ──
    // This ensures StoreGate validates the store exists in the DB.
    // Non-existent subdomains will see "Store Not Found" instead of the marketing page.
    console.log(`[proxy] subdomain rewriting → /app/${domainParam}${url.pathname}`);

    return NextResponse.rewrite(
        new URL(`/app/${domainParam}${url.pathname}${url.search}`, req.url)
    );
});
// NOTE: No satellite config needed. Clerk natively shares sessions
// across *.triadpay.tech via root-level cookie scoped to .triadpay.tech.

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
