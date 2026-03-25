import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { WLOwnerSidebar } from "@/components/dashboard/WLOwnerSidebar";
import { ThemeProvider } from "@/components/dashboard/ThemeProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function WLOwnerLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ domain: string }>;
}) {
    const { domain } = await params;
    // ── Bouncer: Only WL Owners may enter ───────────────────────────────
    const user = await currentUser();
    const dashboardRole = user?.unsafeMetadata?.dashboardRole as string | undefined;
    const role = user?.unsafeMetadata?.role as string | undefined;
    const storeSlug = user?.unsafeMetadata?.storeSlug as string | undefined;

    // Affiliates → bounce to portal
    if (role === "AFFILIATE") {
        redirect("/portal");
    }

    // Non-WL Owners → bounce to seller dashboard
    if (dashboardRole !== "WL_OWNER") {
        redirect("/seller");
    }

    const isMultiTenant = process.env.NEXT_PUBLIC_MULTI_TENANT === "true";
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const headersList = await headers();
    const protocol = headersList.get("x-forwarded-proto") || "https";

    // WL Owners on root domain ("default") → redirect to their subdomain
    if (isMultiTenant && domain === "default" && storeSlug) {
        redirect(`${protocol}://${storeSlug}.${rootDomain}/dashboard`);
    }

    // Domain mismatch: WL Owner on wrong subdomain → redirect to their correct one
    if (isMultiTenant && domain !== "default" && storeSlug && domain !== storeSlug) {
        redirect(`${protocol}://${storeSlug}.${rootDomain}/dashboard`);
    }

    return (
        <ThemeProvider>
            <DashboardShell sidebar={<WLOwnerSidebar />}>
                {children}
            </DashboardShell>
        </ThemeProvider>
    );
}
