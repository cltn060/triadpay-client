import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SellerSidebar } from "@/components/dashboard/SellerSidebar";
import { ThemeProvider } from "@/components/dashboard/ThemeProvider";
import { MembershipGate } from "@/components/membership/MembershipGate";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function SellerLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ domain: string }>;
}) {
    const { domain } = await params;

    // ── Bouncer: Only Sellers may enter ──────────────────────────────
    const user = await currentUser();
    const role = user?.unsafeMetadata?.role as string | undefined;

    // If the user is explicitly an AFFILIATE, bounce them to the portal
    if (role === "AFFILIATE") {
        redirect("/portal");
    }

    return (
        <ThemeProvider>
            <MembershipGate storeSlug={domain}>
                <DashboardShell sidebar={<SellerSidebar />}>
                    {children}
                </DashboardShell>
            </MembershipGate>
        </ThemeProvider>
    );
}

