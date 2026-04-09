import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Traffic cop: routes authenticated users to the correct dashboard.
// In multi-tenant mode, this fires on subdomain requests (e.g. slug.triadpay.com/).
// Unauthenticated users are sent to sign-in.
export default async function TenantRootPage() {
    const user = await currentUser();

    // No session → send to sign-in (Clerk will handle the redirect)
    if (!user) {
        redirect("/sign-in");
    }

    const role = user.unsafeMetadata?.role as string | undefined;
    const dashboardRole = user.unsafeMetadata?.dashboardRole as string | undefined;

    if (role === "AFFILIATE") {
        redirect("/portal");
    }

    if (dashboardRole === "WL_OWNER") {
        redirect("/dashboard");
    }

    // Default: sellers
    redirect("/seller");
}
