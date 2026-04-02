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

    const metadata = user.unsafeMetadata || {};

    const role = metadata.role as string | undefined;
    const dashboardRole = metadata.dashboardRole as string | undefined;
    const storeSlug = metadata.storeSlug as string | undefined;
    const inviteToken = metadata.inviteToken as string | undefined;

    const isMultiTenant = process.env.NEXT_PUBLIC_MULTI_TENANT === "true";
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

    const headersList = headers();
    const protocol = headersList.get("x-forwarded-proto") ?? "https";

    const buildUrl = (subdomain: string, path: string) =>
        `${protocol}://${subdomain}.${rootDomain}${path}`;

    // =========================
    // Affiliates
    // =========================
    if (role === "AFFILIATE") {
        if (isMultiTenant && storeSlug) {
            redirect(buildUrl(storeSlug, "/portal"));
        }

        if (isMultiTenant) {
            return (
                <AffiliateRedirectResolver
                    rootDomain={rootDomain}
                    protocol={protocol}
                    storeSlug={storeSlug}
                />
            );
        }

        redirect("/portal");
    }

    // =========================
    // WL Owners
    // =========================
    if (dashboardRole === "WL_OWNER") {
        if (isMultiTenant && storeSlug) {
            redirect(buildUrl(storeSlug, "/dashboard"));
        }

        redirect("/onboarding");
    }

    // =========================
    // Sellers
    // =========================
    if (role === "SELLER") {
        if (isMultiTenant && storeSlug) {
            redirect(buildUrl(storeSlug, "/seller"));
        }

        if (isMultiTenant) {

            return (
                <SellerRedirectResolver
                    rootDomain={rootDomain}
                    protocol={protocol}
                    dashboardPath="/seller"
                    inviteToken={inviteToken}
                />
            );
        }

        redirect("/seller");
    }

    // =========================
    // No role yet (race condition)
    // =========================
    if (!role && !dashboardRole) {
        if (isMultiTenant) {
            return (
                <SellerRedirectResolver
                    rootDomain={rootDomain}
                    protocol={protocol}
                    dashboardPath="/seller"
                    inviteToken={inviteToken}
                />
            );
        }

        redirect("/onboarding");
    }

    redirect("/");
}