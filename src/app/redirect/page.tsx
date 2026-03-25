import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SellerRedirectResolver } from "./SellerRedirectResolver";
import { AffiliateRedirectResolver } from "./AffiliateRedirectResolver";

export default async function RedirectPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/");
    }

    const role = user.unsafeMetadata?.role as string | undefined;
    const dashboardRole = user.unsafeMetadata?.dashboardRole as string | undefined;
    const storeSlug = (user.unsafeMetadata?.storeSlug as string) || undefined;
    const inviteToken = (user.unsafeMetadata?.inviteToken as string) || undefined;

    const isMultiTenant = process.env.NEXT_PUBLIC_MULTI_TENANT === "true";
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const headersList = await headers();
    const protocol = headersList.get("x-forwarded-proto") || "https";

    console.log(`[redirect] user=${user.id} role=${role} dashboardRole=${dashboardRole} storeSlug=${storeSlug} isMultiTenant=${isMultiTenant}`);

    // Affiliates
    if (role === "AFFILIATE") {
        if (isMultiTenant && storeSlug) {
            redirect(`${protocol}://${storeSlug}.${rootDomain}/portal`);
        }
        // No storeSlug in metadata — use client-side Convex query to resolve store
        if (isMultiTenant) {
            return <AffiliateRedirectResolver rootDomain={rootDomain} protocol={protocol} storeSlug={storeSlug} />;
        }
        redirect("/portal");
    }

    // WL Owners
    if (dashboardRole === "WL_OWNER") {
        if (isMultiTenant && storeSlug) {
            redirect(`${protocol}://${storeSlug}.${rootDomain}/dashboard`);
        }
        redirect("/onboarding");
    }

    // Sellers
    if (role === "SELLER") {
        if (isMultiTenant && storeSlug) {
            redirect(`${protocol}://${storeSlug}.${rootDomain}/seller`);
        }
        // No storeSlug in metadata — use client-side Convex query (WebSocket, reliable)
        if (isMultiTenant) {
            console.log("[redirect] SELLER no slug → rendering client-side resolver");
            return <SellerRedirectResolver rootDomain={rootDomain} protocol={protocol} dashboardPath="/seller" inviteToken={inviteToken} />;
        }
        redirect("/seller");
    }

    // No role — might be new user whose webhook hasn't fired
    if (!role && !dashboardRole) {
        if (isMultiTenant) {
            return <SellerRedirectResolver rootDomain={rootDomain} protocol={protocol} dashboardPath="/seller" inviteToken={inviteToken} />;
        }
        redirect("/onboarding");
    }

    redirect("/");
}
