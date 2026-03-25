import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AffiliateSidebar } from "@/components/dashboard/AffiliateSidebar";
import { MembershipGate } from "@/components/membership/MembershipGate";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function AffiliateLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ domain: string }>;
}) {
    const { domain } = await params;

    // ── Bouncer: Only Affiliates may enter ──────────────────────────
    const user = await currentUser();
    const role = user?.unsafeMetadata?.role as string | undefined;

    // If the user is NOT an affiliate (seller or undefined), bounce to seller dashboard
    if (role !== "AFFILIATE") {
        redirect("/seller");
    }

    return (
        <MembershipGate storeSlug={domain}>
            <DashboardShell sidebar={<AffiliateSidebar />}>
                {children}
            </DashboardShell>
        </MembershipGate>
    );
}
