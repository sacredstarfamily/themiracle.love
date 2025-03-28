'use client';

import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useCartStore from "@/context/cart-context";
import Image from "next/image";

type ShoppingCartProps = {
    isOpen: boolean;
    onClose: () => void;

}
export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
    const { cart, removeFromCart } = useCartStore();

    return (
        <div className={`bg-white mx-auto transition-opacity duration-2000 opacity-${isOpen ? 0 : 1} ${isOpen ? 'block' : 'hidden'}`}>

            <div className="bg-white bg-opacity-55 fixed inset-5 sm:inset-1 lg:inset-0 flex justify-center items-center rounded-md p-4 sm:p-6 md:p-8 lg:p-10 transition-opacity duration-100" role="dialog" aria-modal="true" aria-labelledby="shoppingCartTitle">
                <button className="absolute right-2 top-2 p-3 z-90" onClick={onClose}>
                    <FontAwesomeIcon className="text-5xl" icon={faXmark} />
                </button>
                <div className="bg-white w-3/4 h-3/4 z-50 p-5 rounded-lg shadow-lg">
                    <h2>Shopping Cart</h2>
                    {cart.length === 0 ? (
                        <p className="text-center text-gray-500">Your cart is empty.</p>
                    ) : (
                        <div className="overflow-y-auto h-3/4 scrollbar">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-center border-b py-2">
                                    {item.image_url ? (
                                        <Image src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" width={20} height={20} />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                            <span className="text-gray-500">No Image</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col ml-4">
                                        <h3 className="text-lg font-semibold">{item.name}</h3>
                                        <p className="text-gray-500">${item.price}</p>
                                    </div>
                                    <button className="text-red-500 hover:text-red-700" onClick={() => removeFromCart(item.id)}>Remove</button>
                                </div>
                            ))}
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-lg font-semibold">Total:</p>
                                <p className="text-lg font-semibold">${cart.reduce((total, item) => item && item.price ? total + item.price : total, 0).toFixed(2)}</p>
                                <button className="" onClick={() => { console.log("continue") }} >CheckOut</button>
                            </div>
                        </div>

                    )}


                </div>
            </div>
        </div>
    )

}