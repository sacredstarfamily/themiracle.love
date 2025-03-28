import { PayPalProduct } from "@/lib/definitions";
import { create } from "zustand";

interface CartStore {
    cart: PayPalProduct[];
    addToCart: (product: PayPalProduct) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
}
const useCartStore = create<CartStore>((set) => ({
    cart: [],
    addToCart: (product) => {
        set((state) => ({
            cart: [...state.cart, product],
        }));
    }
    ,
    removeFromCart: (productId) => {
        set((state) => ({
            cart: state.cart.filter((product) => product.id !== productId),
        }));
    }
    ,
    clearCart: () => {
        set({ cart: [] });
    }
}));
export default useCartStore;
