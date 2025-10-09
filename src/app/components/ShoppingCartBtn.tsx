'use client';
import useCartStore from '@/context/cart-context';
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


type shoppingCartBtnProps = {
    onClick: () => void;
};
function ShoppingCartBtn({ onClick }: shoppingCartBtnProps) {
    const { getItemCount } = useCartStore();
    const itemCount = getItemCount();

    const handleCartClick = () => {
        // Logic to display the shopping cart component
        onClick();
        console.log('Shopping cart button clicked');
    };

    // Hide the cart button when empty
    if (itemCount === 0) {
        return null;
    }

    return (
        <div className='fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40'>
            <button
                onClick={handleCartClick}
                className="w-12 h-12 md:w-14 md:h-14 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
                <FontAwesomeIcon className="text-center" icon={faShoppingCart} />
            </button>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                {itemCount}
            </span>
        </div>
    );
};

export default ShoppingCartBtn;