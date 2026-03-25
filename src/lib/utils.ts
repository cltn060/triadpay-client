import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Extracts a clean, user-facing message from a Convex error.
 *
 * Convex wraps thrown errors with metadata:
 *   "[CONVEX M(module:fn)] [Request ID: xxx] Server Error\nUncaught Error: Actual message"
 *
 * This strips that prefix and returns just "Actual message".
 */
export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
    if (!err) return fallback;
    const raw = err instanceof Error ? err.message : String(err);

    // Try to extract message after "Uncaught Error: "
    const match = raw.match(/Uncaught Error:\s*([\s\S]+)/);
    if (match) return match[1].trim();

    // If there's a CONVEX prefix but no "Uncaught Error", strip the prefix
    if (raw.startsWith("[CONVEX")) {
        const lines = raw.split("\n");
        // Return last non-empty line (the actual message)
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line && !line.startsWith("[")) return line;
        }
    }

    return raw || fallback;
}