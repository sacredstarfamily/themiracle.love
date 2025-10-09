import { PayPalProduct } from "@/lib/definitions";
import { create } from "zustand";

interface CartItem extends PayPalProduct {
    quantity?: number;
}

interface CartStore {
    cart: CartItem[];
    addToCart: (product: PayPalProduct) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalValue: () => number;
    getItemCount: () => number;
    isEmpty: () => boolean;
}

const useCartStore = create<CartStore>((set, get) => ({
    cart: [],

    addToCart: (product) => {
        set((state) => {
            const existingItem = state.cart.find(item => item.id === product.id);
            if (existingItem) {
                return {
                    cart: state.cart.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: (item.quantity || 1) + 1 }
                            : item
                    )
                };
            } else {
                return {
                    cart: [...state.cart, { ...product, quantity: 1 }]
                };
            }
        });
    },

    removeFromCart: (productId) => {
        set((state) => ({
            cart: state.cart.filter((product) => product.id !== productId),
        }));
    },

    updateQuantity: (productId, quantity) => {
        set((state) => ({
            cart: state.cart.map(item =>
                item.id === productId
                    ? { ...item, quantity: Math.max(0, quantity) }
                    : item
            ).filter(item => item.quantity! > 0)
        }));
    },

    clearCart: () => {
        set({ cart: [] });
    },

    getTotalValue: () => {
        const { cart } = get();
        return cart.reduce((total, item) => {
            return total + ((item.price || 0) * (item.quantity || 1));
        }, 0);
    },

    getItemCount: () => {
        const { cart } = get();
        return cart.reduce((count, item) => count + (item.quantity || 1), 0);
    },

    isEmpty: () => {
        const { cart } = get();
        return cart.length === 0;
    }
}));

export default useCartStore;
