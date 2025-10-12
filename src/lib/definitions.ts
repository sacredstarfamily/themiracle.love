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
    type?: string;
    category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS';
    image_url?: string;
    home_url?: string;
    price?: number; // Price for cart functionality
    quantity?: number; // Quantity for cart items
    [key: string]: unknown;
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