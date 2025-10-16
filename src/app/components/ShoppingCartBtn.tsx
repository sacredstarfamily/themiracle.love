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
            className="relative w-12 h-12 md:w-14 md:h-14 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            aria-label={`Shopping cart with ${displayItemCount} product types, ${itemCount} total items`}
        >
            <FontAwesomeIcon
                className="text-center shopping-cart-icon"
                icon={faShoppingCart}
            />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                {displayItemCount}
            </span>
        </button>
    );
}

export default ShoppingCartBtn;