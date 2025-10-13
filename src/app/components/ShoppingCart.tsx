'use client';

import { createOrder } from '@/actions/orderActions';
import { Spinner } from "@/components/icons";
import useAuthStore from '@/context/auth-context';
import useCartStore from '@/context/cart-context';
import { faMinus, faPlus, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PayPalButtonsComponentOptions } from "@paypal/paypal-js/types/components/buttons";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import Image from "next/image";
import { useState } from "react";

type ShoppingCartProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
    const [{ isResolved }] = usePayPalScriptReducer();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const {
        cart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalValue,
        getItemCount
    } = useCartStore();

    const { user } = useAuthStore();

    const totalValue = getTotalValue();
    const itemCount = getItemCount();

    // Fix image URL path function
    const getImageUrl = (url: string | undefined) => {
        if (!url) return '/placeholder.png';

        // Remove /public prefix if it exists
        if (url.startsWith('/public/')) {
            return url.replace('/public', '');
        }

        // If it's already a proper URL (starts with http or /)
        if (url.startsWith('http') || url.startsWith('/')) {
            return url;
        }

        // Add leading slash for relative paths
        return '/' + url;
    };

    if (!isOpen) return null;

    // Prevent cart from closing during PayPal interactions
    const handleBackdropClick = (e: React.MouseEvent) => {
        // Only close if clicking the backdrop and not processing payment
        if (e.target === e.currentTarget && !isProcessing) {
            onClose();
        }
    };

    // Enhanced close handler that respects PayPal state
    const handleCartClose = () => {
        if (isProcessing) {
            console.log('Payment is processing, preventing cart close');
            return;
        }
        onClose();
    };

    const paypalButtonOptions: PayPalButtonsComponentOptions = {
        style: {
            color: "blue",
            shape: "rect",
            label: "pay",
            disableMaxWidth: false,
            height: 45,
            layout: "vertical"
        },
        createOrder: async (data, actions) => {
            setIsProcessing(true);
            setPaymentError(null);

            try {
                const items = cart.map(item => ({
                    name: item.name || 'Unknown Item',
                    quantity: (item.quantity || 1).toString(),
                    category: 'DIGITAL_GOODS' as const,
                    unit_amount: {
                        currency_code: 'USD',
                        value: (item.price || 0).toFixed(2)
                    }
                }));

                console.log("Creating PayPal order with items:", items);

                return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            reference_id: `order_${Date.now()}`,
                            amount: {
                                currency_code: "USD",
                                value: totalValue.toFixed(2),
                                breakdown: {
                                    item_total: {
                                        currency_code: "USD",
                                        value: totalValue.toFixed(2)
                                    }
                                }
                            },
                            items: items,
                            description: `Purchase of ${itemCount} items from themiracle.love`
                        }
                    ],
                    application_context: {
                        brand_name: "themiracle.love",
                        landing_page: "BILLING",
                        shipping_preference: "NO_SHIPPING",
                        user_action: "PAY_NOW"
                    }
                });
            } catch (error) {
                console.error("Error creating PayPal order:", error);
                setPaymentError("Failed to create payment order. Please try again.");
                setIsProcessing(false);
                throw error;
            }
        },
        onApprove: async (data, actions) => {
            try {
                console.log("PayPal payment approved, capturing order:", data.orderID);

                const details = await actions.order!.capture();
                console.log("Payment captured successfully:", details);

                // Extract payer information from PayPal response
                const payerInfo = details.payer;
                const captureInfo = details.purchase_units?.[0]?.payments?.captures?.[0];

                // Create order in database
                try {
                    const orderData = {
                        userId: user?.id || 'guest', // Use 'guest' for non-logged-in users
                        paypal_order_id: details.id ?? '', // Ensure string, never undefined
                        paypal_payer_id: payerInfo?.payer_id ?? '',
                        paypal_payer_email: payerInfo?.email_address ?? '',
                        paypal_payer_name: payerInfo?.name ? `${payerInfo.name.given_name || ''} ${payerInfo.name.surname || ''}`.trim() : '',
                        paypal_capture_id: captureInfo?.id ?? '',
                        paypal_transaction_id: captureInfo?.id ?? '', // Same as capture ID in most cases
                        total_amount: totalValue,
                        currency_code: "USD",
                        order_metadata: {
                            cart_items: cart.map(item => ({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                quantity: item.quantity,
                                image_url: item.image_url
                            })),
                            payment_details: {
                                paypal_order_id: details.id ?? '',
                                payment_method: 'paypal',
                                capture_time: captureInfo?.create_time,
                                capture_status: captureInfo?.status
                            },
                            user_info: user ? {
                                user_id: user.id,
                                user_email: user.email,
                                user_name: user.name
                            } : {
                                guest_payer_email: payerInfo?.email_address ?? '',
                                guest_payer_name: payerInfo?.name ? `${payerInfo.name.given_name || ''} ${payerInfo.name.surname || ''}`.trim() : ''
                            }
                        },
                        items: cart.map(item => ({
                            name: item.name || 'Unknown Item',
                            price: item.price || 0,
                            quantity: item.quantity || 1,
                            paypal_product_id: item.id
                        }))
                    };

                    console.log("Creating order in database:", orderData);
                    const dbOrder = await createOrder(orderData);
                    console.log("Order created in database:", dbOrder);

                } catch (dbError) {
                    console.error("Failed to create order in database:", dbError);
                    // Don't fail the entire transaction if DB creation fails
                    // The payment was successful, so we should still proceed
                    alert("Payment successful but there was an issue saving your order details. Please contact support with your transaction ID: " + details.id);
                }

                // Handle successful payment
                setPaymentSuccess(true);
                setPaymentError(null);

                // Clear the cart after successful payment
                clearCart();

                // Show success message
                alert(
                    `🎉 Payment successful!\n\nTransaction ID: ${details.id}\nAmount: $${totalValue.toFixed(2)}\n\nThank you for your purchase! Your digital items will be available in your account shortly.`
                );

                // Close the cart immediately after success
                onClose();
                setPaymentSuccess(false);

            } catch (error) {
                console.error("Payment capture error:", error);
                setPaymentError("Payment was approved but failed to complete. Please contact support.");
                alert("There was an error processing your payment. Please contact support with your order details.");
            } finally {
                setIsProcessing(false);
            }
        },
        onError: (error) => {
            console.error("PayPal error:", error);
            setPaymentError("PayPal encountered an error. Please try again or use a different payment method.");
            setIsProcessing(false);
            alert("There was an error with PayPal. Please try again or contact support if the problem persists.");
        },
        onCancel: (data) => {
            console.log("Payment cancelled by user:", data);
            setIsProcessing(false);
            setPaymentError(null);
            // Don't close cart on cancel - let user try again
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
            onClick={handleBackdropClick}
        >
            <div className="bg-white w-full max-w-md h-full shadow-lg transform transition-transform overflow-hidden flex flex-col">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Shopping Cart ({itemCount})
                    </h2>
                    <button
                        onClick={handleCartClose}
                        disabled={isProcessing}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Close cart"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Payment Status Messages */}
                {paymentError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-4 mt-2 rounded relative">
                        <button
                            onClick={() => setPaymentError(null)}
                            className="absolute top-1 right-2 text-red-400 hover:text-red-600"
                        >
                            ×
                        </button>
                        <p className="text-sm font-medium">Payment Error</p>
                        <p className="text-sm">{paymentError}</p>
                    </div>
                )}

                {paymentSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mx-4 mt-2 rounded">
                        <p className="text-sm">✅ Payment successful! Thank you for your purchase.</p>
                    </div>
                )}

                {/* Processing indicator */}
                {isProcessing && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 mx-4 mt-2 rounded">
                        <p className="text-sm">💳 Processing payment... Please wait and do not close this window.</p>
                    </div>
                )}

                {/* Scrollable Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {cart.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="mb-4">
                                <svg
                                    className="w-12 h-12 text-gray-300 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium">Your cart is empty</p>
                            <p className="text-sm mt-2">Add some items to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                    {/* Item Image with proper URL handling */}
                                    <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                        <Image
                                            src={getImageUrl(item.image_url)}
                                            alt={item.name || 'Product'}
                                            fill
                                            className="object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder.png';
                                            }}
                                            unoptimized={getImageUrl(item.image_url).startsWith('/uploads/')}
                                        />
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-sm truncate text-gray-900">
                                            {item.name}
                                        </h3>
                                        <p className="text-gray-600 text-xs">
                                            ${(item.price || 0).toFixed(2)} each
                                        </p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center space-x-2 mt-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-xs hover:bg-gray-300 transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                <FontAwesomeIcon icon={faMinus} className="w-3 h-3" />
                                            </button>
                                            <span className="text-sm font-medium w-8 text-center">
                                                {item.quantity || 1}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded text-xs hover:bg-gray-300 transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Item Total & Remove */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-medium text-sm text-gray-900">
                                            ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                        </p>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="mt-2 p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                            aria-label="Remove item"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sticky Footer with Total and PayPal */}
                {cart.length > 0 && (
                    <div className="sticky bottom-0 border-t p-4 space-y-4 bg-white shadow-lg">
                        {/* Total */}
                        <div className="flex justify-between items-center text-lg font-semibold text-gray-900 border-t pt-2">
                            <span>Total:</span>
                            <span>${totalValue.toFixed(2)} USD</span>
                        </div>

                        {/* Clear Cart Button */}
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to clear your cart?')) {
                                    clearCart();
                                    setPaymentError(null);
                                    setPaymentSuccess(false);
                                }
                            }}
                            disabled={isProcessing}
                            className="w-full py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Clear Cart
                        </button>

                        {/* PayPal Buttons */}
                        <div className="paypal-button-container relative">
                            {paymentError && (
                                <button
                                    onClick={() => {
                                        setPaymentError(null);
                                        setIsProcessing(false);
                                    }}
                                    className="w-full mb-2 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    Try Payment Again
                                </button>
                            )}

                            {isResolved && !paymentSuccess ? (
                                <PayPalButtons {...paypalButtonOptions} />
                            ) : (
                                <div className="flex items-center justify-center py-6 bg-gray-50 rounded">
                                    <Spinner />
                                    <span className="ml-2 text-sm text-gray-600">
                                        {isProcessing ? 'Processing payment...' :
                                            paymentSuccess ? 'Payment completed!' :
                                                'Loading PayPal...'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Enhanced Security Notice */}
                        <div className="text-center">
                            <p className="text-xs text-gray-500">
                                🔒 Secure payment powered by PayPal
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Your payment information is encrypted and secure
                            </p>
                            {isProcessing && (
                                <p className="text-xs text-blue-500 mt-1 font-medium">
                                    ⚠️ Do not close this window during payment processing
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}