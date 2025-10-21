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
    description?: string | null;
    slug?: string | null;
    is_active?: boolean;
    is_digital?: boolean;
    inventory_tracked?: boolean;
    paypal_product_id?: string | null;
    paypal_sync_status?: string | null;
    paypal_data?: unknown;
    paypal_last_sync?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    paypal_status?: 'synced' | 'missing' | 'local_only' | 'paypal_only';
}

export interface DeleteItemResult extends Item {
    paypalDeleted: boolean;
    paypalMessage: string;
}

export interface CartItem extends PayPalProduct {
    cartItemId: string; // Unique identifier for each cart item instance
    quantity: 1; // Always 1 since we use separate instances
}

// Display version of cart item for UI
export interface DisplayCartItem {
    productId: string;
    name: string;
    price: number;
    image_url?: string;
    category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS';
    description?: string;
    quantity: number; // Total quantity for this product
    cartItemIds: string[]; // Array of individual cart item IDs
}