export type NotificationType =
    | "sale"
    | "affiliate_approved"
    | "affiliate_rejected"
    | "payout_sent"
    | "payout_failed"
    | "new_affiliate"
    | "product_approved"
    | "product_rejected"
    | "system"
    | "welcome";

export interface Notification {
    _id: string;
    _creationTime: number;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    readAt?: number;
    metadata?: {
        amount?: number;
        currency?: string;
        productName?: string;
        affiliateName?: string;
        transactionId?: string;
        payoutId?: string;
        link?: string;
    };
}

export interface NotificationGroup {
    label: string;
    notifications: Notification[];
}
