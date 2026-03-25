import { SignUp } from "@clerk/nextjs";

export default async function SignUpPage({
    searchParams,
}: {
    searchParams: Promise<{ role?: string; store?: string }>;
}) {
    const params = await searchParams;
    const isAffiliate = params.role === "affiliate";
    const roleToAssign = isAffiliate ? "AFFILIATE" : "WL_OWNER";
    const targetStore = params.store;

    const redirectDestination = isAffiliate ? "/redirect" : "/onboarding";

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] font-sans p-6">
            <div className="flex flex-col items-center gap-6">
                {isAffiliate && targetStore && (
                    <div className="text-center space-y-2 mb-4">
                        <h1 className="text-2xl font-bold text-white">
                            Partner Registration
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Applying to be an affiliate for{" "}
                            <span className="text-[#0df20d] font-bold">
                                {targetStore}
                            </span>
                        </p>
                    </div>
                )}

                <SignUp
                    appearance={{
                        elements: {
                            formButtonPrimary:
                                "bg-[#0df20d] hover:bg-[#0df20d]/90 text-black font-bold",
                            card: "bg-[#121212] border border-[#2a2a2a] shadow-2xl",
                            headerTitle: "text-white",
                            headerSubtitle: "text-gray-400",
                        },
                    }}
                    unsafeMetadata={{
                        role: roleToAssign,
                        ...(targetStore ? { storeSlug: targetStore } : {}),
                    }}
                    fallbackRedirectUrl={redirectDestination}
                    signInUrl="/sign-in"
                />
            </div>
        </div>
    );
}
