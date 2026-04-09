"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// NOTE: No satellite config needed. Clerk natively shares sessions
// across *.triadpay.com via root-level cookie scoped to .triadpay.com.
// Satellite mode is only for cross-root-domain auth (e.g. triadpay.com ↔ another-brand.com).

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
            signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
            signInFallbackRedirectUrl="/redirect"
            signUpFallbackRedirectUrl="/onboarding"
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}

