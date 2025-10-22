'use client';
import useCartStore from '@/context/cart-context';
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


type shoppingCartBtnProps = {
    onClick: () => void;
};
function ShoppingCartBtn({ onClick }: shoppingCartBtnProps) {
    const { getItemCount, getDisplayCart } = useCartStore();
    const itemCount = getItemCount(); // Total individual items for PayPal
    const displayCart = getDisplayCart();
    const displayItemCount = displayCart.length; // Number of unique products for UI

    const handleCartClick = () => {
        console.log('Shopping cart button clicked, display items:', displayItemCount, 'total items:', itemCount);
        onClick();
    };

    // Hide the cart button when empty
    if (itemCount === 0) {
        return null;
    }

    return (
        <button
            onClick={handleCartClick}
            className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 animate-pulse"
            aria-label={`Shopping cart with ${displayItemCount} product types, ${itemCount} total items`}
        >
            <FontAwesomeIcon
                className="text-center shopping-cart-icon text-xl"
                icon={faShoppingCart}
            />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                {displayItemCount}
            </span>
        </button>
    );
}

export default ShoppingCartBtn;