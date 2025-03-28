'use client';
import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import useCartStore from '@/context/cart-context';


type shoppingCartBtnProps = {
    onClick: () => void;
};
function ShoppingCartBtn({ onClick }: shoppingCartBtnProps) {
    const { cart } = useCartStore();
    const itemCount = cart.length;
    const handleCartClick = () => {
        // Logic to display the shopping cart component
        onClick();
        console.log('Shopping cart button clicked');
    };

    return (
        <div className='absolute flex items-center justify-center right-2 top-10 sm:top-20 lg:top-2 p-2'>
            <button
                onClick={handleCartClick}
                className="w-10 h-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-1 rounded-full"
            >
                <FontAwesomeIcon className="text-center" icon={faShoppingCart} />

            </button>
            <span className="absolute bottom-0 right-0 bg-red-500 text-white text-xs text-center font-bold w-5 h-5 rounded-full px-1 py-0.5">
                {itemCount}
            </span>
        </div>
    );
};

export default ShoppingCartBtn;