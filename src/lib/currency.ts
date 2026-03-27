export function formatMoney(cents: number | null | undefined, currency = "USD", locale?: string) {
    if (cents == null || Number.isNaN(Number(cents))) return "";
    const amount = Number(cents) / 100;
    try {
        return new Intl.NumberFormat(locale || undefined, { style: "currency", currency }).format(amount);
    } catch (e) {
        // Fallback to simple formatting
        return `${currency} ${amount.toFixed(2)}`;
    }
}

export function formatMoneyCompact(cents: number | null | undefined, currency = "USD", locale?: string) {
    if (cents == null || Number.isNaN(Number(cents))) return "";
    const amount = Number(cents) / 100;
    try {
        return new Intl.NumberFormat(locale || undefined, { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(amount);
    } catch (e) {
        return `${currency} ${amount.toFixed(1)}`;
    }
}
