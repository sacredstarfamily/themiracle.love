'use client';

import useCartStore from "@/context/cart-context";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

interface ShoppingCartProps {
    onClose: () => void;
}

export default function ShoppingCart({ onClose }: ShoppingCartProps) {
    const { cart, removeFromCart } = useCartStore();

    return (
        <div className="bg-white bg-opacity-55 fixed inset-0 flex justify-center items-center z-50" role="dialog" aria-modal="true" aria-labelledby="shoppingCartTitle">
            <button className="absolute right-4 top-4 p-3 z-60" onClick={onClose}>
                <FontAwesomeIcon className="text-3xl text-gray-700 hover:text-gray-900" icon={faXmark} />
            </button>

            <div className="bg-white w-11/12 md:w-3/4 lg:w-1/2 h-3/4 z-50 p-5 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>

                {cart.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>Your cart is empty.</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="overflow-y-auto h-3/4 scrollbar">
                        {cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-center border-b py-2">
                                {item.image_url ? (
                                    <Image
                                        src={item.image_url}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded"
                                        width={64}
                                        height={64}
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                        <span className="text-gray-500 text-xs">No Image</span>
                                    </div>
                                )}

                                <div className="flex flex-col ml-4 flex-grow">
                                    <h3 className="text-lg font-semibold">{item.name}</h3>
                                    <p className="text-gray-500">${item.price?.toFixed(2) || '0.00'}</p>
                                </div>

                                <button
                                    className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-lg font-semibold">Total:</p>
                                <p className="text-lg font-semibold">
                                    ${cart.reduce((total, item) => total + (item.price || 0), 0).toFixed(2)}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                                    onClick={() => { console.log("checkout") }}
                                >
                                    Checkout
                                </button>

                                <button
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                                    onClick={onClose}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}