export type SessionPayload = {
    email: string;
    expiresAt: Date;
}
export interface User {
    id: string;
    name: string | null;
    email: string;
    sessionToken: string | null;
}

export interface PayPalProduct {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    price: number; // Make price required
    category?: string;
    type?: string;
    quantity?: number;
}

export interface Item {
    id: string;
    name: string;
    img_url: string;
    price: number;
    quantity: number;
    paypal_product_id?: string | null;
    paypal_data?: unknown;
    paypal_status?: 'synced' | 'missing' | 'local_only' | 'paypal_only';
}

export interface DeleteItemResult {
    id: string;
    name: string;
    img_url: string;
    price: number;
    quantity: number;
    paypal_product_id?: string | null;
    paypalDeleted: boolean;
    paypalMessage: string;
}

export interface CartItem extends PayPalProduct {
    quantity: number;
}