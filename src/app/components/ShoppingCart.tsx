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
import { useCallback, useEffect, useRef, useState } from "react";

type ShoppingCartProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
    const [{ isResolved, isPending }] = usePayPalScriptReducer();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [buttonsKey, setButtonsKey] = useState(0);
    const [buttonsReady, setButtonsReady] = useState(false);

    // Processing state management
    const processingRef = useRef(false);
    const paypalContainerRef = useRef<HTMLDivElement>(null);
    const mountTimeoutRef = useRef<NodeJS.Timeout>();

    const {
        cart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalValue,
        getItemCount,
        getDisplayCart
    } = useCartStore();

    const { user } = useAuthStore();

    const totalValue = getTotalValue();
    const itemCount = getItemCount();
    const displayCart = getDisplayCart();

    // Reset states when cart opens/closes
    useEffect(() => {
        if (isOpen) {
            setPaymentError(null);
            setPaymentSuccess(false);
            processingRef.current = false;
            setIsProcessing(false);

            // Delay button initialization to prevent zoid conflicts
            if (mountTimeoutRef.current) {
                clearTimeout(mountTimeoutRef.current);
            }

            mountTimeoutRef.current = setTimeout(() => {
                setButtonsReady(true);
                setButtonsKey(prev => prev + 1);
            }, 300);
        } else {
            setButtonsReady(false);
            if (mountTimeoutRef.current) {
                clearTimeout(mountTimeoutRef.current);
            }

            // Clean up when cart closes
            setTimeout(() => {
                setButtonsKey(prev => prev + 1);
                setPaymentError(null);
                setPaymentSuccess(false);
            }, 100);
        }

        return () => {
            if (mountTimeoutRef.current) {
                clearTimeout(mountTimeoutRef.current);
            }
        };
    }, [isOpen]);

    // Handle PayPal script resolution
    useEffect(() => {
        if (!isResolved || !isOpen || cart.length === 0) {
            setButtonsReady(false);
            return;
        }

        // Ensure buttons are ready after script loads
        const readyTimeout = setTimeout(() => {
            setButtonsReady(true);
        }, 200);

        return () => clearTimeout(readyTimeout);
    }, [isResolved, isOpen, cart.length]);

    // Fix image URL path function
    const getImageUrl = (url: string | undefined) => {
        if (!url) return '/themiracle.png';
        if (url.startsWith('/public/')) {
            return url.replace('/public', '');
        }
        if (url.startsWith('http') || url.startsWith('/')) {
            return url;
        }
        return '/' + url;
    };

    // Enhanced close handler
    const handleCartClose = useCallback(() => {
        if (isProcessing || processingRef.current) {
            console.log('Payment is processing, preventing cart close');
            return;
        }
        onClose();
    }, [isProcessing, onClose]);

    // Backdrop click handler
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isProcessing && !processingRef.current) {
            onClose();
        }
    }, [isProcessing, onClose]);

    // Clear error and retry PayPal
    const handleRetryPayment = useCallback(() => {
        setPaymentError(null);
        processingRef.current = false;
        setIsProcessing(false);
        setButtonsReady(false);

        setTimeout(() => {
            setButtonsKey(prev => prev + 1);
            setButtonsReady(true);
        }, 500);
    }, []);

    if (!isOpen) return null;

    const paypalButtonOptions: PayPalButtonsComponentOptions = {
        style: {
            color: "blue",
            shape: "rect",
            label: "pay",
            height: 45,
            layout: "vertical",
            tagline: false,
        },
        createOrder: async (data, actions) => {
            if (processingRef.current || isProcessing) {
                throw new Error("Order creation already in progress");
            }

            processingRef.current = true;
            setIsProcessing(true);
            setPaymentError(null);

            try {
                console.log("Creating PayPal order with items:", cart.length);

                const paypalItems = cart.map(cartItem => ({
                    name: cartItem.name || 'Unknown Item',
                    quantity: '1',
                    category: cartItem.category || 'DIGITAL_GOODS' as const,
                    unit_amount: {
                        currency_code: 'USD',
                        value: (cartItem.price || 0).toFixed(2)
                    }
                }));

                const calculatedTotal = cart.reduce((total, cartItem) => {
                    return total + (cartItem.price || 0);
                }, 0);

                return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            reference_id: `order_${Date.now()}`,
                            amount: {
                                currency_code: "USD",
                                value: calculatedTotal.toFixed(2),
                                breakdown: {
                                    item_total: {
                                        currency_code: "USD",
                                        value: calculatedTotal.toFixed(2)
                                    }
                                }
                            },
                            items: paypalItems,
                            description: `Purchase of ${paypalItems.length} items from themiracle.love`
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
                processingRef.current = false;
                setIsProcessing(false);
                throw error;
            }
        },

        onApprove: async (data, actions) => {
            try {
                const details = await actions.order!.capture();
                console.log("Payment captured successfully:", details.id);

                // Extract payer information
                const payerInfo = details.payer;
                const captureInfo = details.purchase_units?.[0]?.payments?.captures?.[0];

                // Create order in database
                const orderItems = cart.map(cartItem => ({
                    name: cartItem.name || 'Unknown Item',
                    price: cartItem.price || 0,
                    quantity: 1,
                    paypal_product_id: cartItem.id
                }));

                const orderData = {
                    userId: user?.id || 'guest',
                    paypal_order_id: details.id || '',
                    paypal_payer_id: payerInfo?.payer_id || '',
                    paypal_payer_email: payerInfo?.email_address || '',
                    paypal_payer_name: payerInfo?.name ? `${payerInfo.name.given_name || ''} ${payerInfo.name.surname || ''}`.trim() : '',
                    paypal_capture_id: captureInfo?.id || '',
                    paypal_transaction_id: captureInfo?.id || '',
                    total_amount: totalValue,
                    currency_code: "USD",
                    order_metadata: {
                        cart_items: displayCart,
                        payment_details: {
                            paypal_order_id: details.id || '',
                            payment_method: 'paypal',
                            capture_time: captureInfo?.create_time,
                            capture_status: captureInfo?.status
                        },
                        user_info: user ? {
                            user_id: user.id,
                            user_email: user.email,
                            user_name: user.name
                        } : {
                            guest_payer_email: payerInfo?.email_address || '',
                            guest_payer_name: payerInfo?.name ? `${payerInfo.name.given_name || ''} ${payerInfo.name.surname || ''}`.trim() : ''
                        }
                    },
                    items: orderItems
                };

                await createOrder(orderData);
                console.log("Order created in database successfully");

                setPaymentSuccess(true);
                setPaymentError(null);
                clearCart();

                alert(
                    `🎉 Payment successful!\n\nTransaction ID: ${details.id}\nAmount: $${totalValue.toFixed(2)}\n\nThank you for your purchase!`
                );

                setTimeout(() => {
                    handleCartClose();
                    setPaymentSuccess(false);
                }, 1500);

            } catch (error) {
                console.error("Payment capture error:", error);
                setPaymentError("Payment was approved but failed to complete. Please contact support.");
                alert("There was an error processing your payment. Please contact support with your order details.");
            } finally {
                processingRef.current = false;
                setIsProcessing(false);
            }
        },

        onError: (error) => {
            console.error("PayPal error:", error);
            setPaymentError("PayPal encountered an error. Please try again.");
            processingRef.current = false;
            setIsProcessing(false);

            // Delay button regeneration
            setTimeout(() => {
                setButtonsKey(prev => prev + 1);
            }, 1000);
        },

        onCancel: () => {
            console.log("Payment cancelled");
            processingRef.current = false;
            setIsProcessing(false);
            setPaymentError(null);
        }
    };

    return (
        <div
            className="sticky top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center p-4"
            style={{
                position: 'sticky',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                zIndex: 50,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            }}
            onClick={handleBackdropClick}
        >
            <div className="bg-white w-full max-w-lg max-h-[95vh] rounded-2xl shadow-2xl transform transition-transform overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-white shadow-sm rounded-t-2xl">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Shopping Cart ({displayCart.length})
                    </h2>
                    <button
                        onClick={handleCartClose}
                        disabled={isProcessing || processingRef.current}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Close cart"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Status Messages */}
                {paymentError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 mx-6 mt-4 rounded-lg relative">
                        <button
                            onClick={() => setPaymentError(null)}
                            className="absolute top-2 right-3 text-red-400 hover:text-red-600 text-lg"
                        >
                            ×
                        </button>
                        <p className="text-sm font-medium">Payment Error</p>
                        <p className="text-sm">{paymentError}</p>
                    </div>
                )}

                {paymentSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 mx-6 mt-4 rounded-lg">
                        <p className="text-sm">✅ Payment successful! Thank you for your purchase.</p>
                    </div>
                )}

                {(isProcessing || processingRef.current) && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 mx-6 mt-4 rounded-lg">
                        <p className="text-sm">💳 Processing payment... Please wait.</p>
                    </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Cart Items */}
                    <div className="p-6">
                        {displayCart.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <div className="mb-6">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                                    </svg>
                                </div>
                                <p className="text-xl font-medium">Your cart is empty</p>
                                <p className="text-sm mt-2">Add some items to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-4 mb-6">
                                {displayCart.map((displayItem) => (
                                    <div key={displayItem.productId} className="flex items-center space-x-4 p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                                        {/* Item Image */}
                                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={getImageUrl(displayItem.image_url)}
                                                alt={displayItem.name || 'Product'}
                                                fill
                                                className="object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/themiracle.png';
                                                }}
                                                unoptimized={getImageUrl(displayItem.image_url).startsWith('/uploads/')}
                                            />
                                        </div>

                                        {/* Item Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-base truncate text-gray-900">
                                                {displayItem.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                ${displayItem.price.toFixed(2)} each
                                            </p>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center space-x-3 mt-3">
                                                <button
                                                    onClick={() => updateQuantity(displayItem.productId, displayItem.quantity - 1)}
                                                    disabled={isProcessing || processingRef.current}
                                                    className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                                                >
                                                    <FontAwesomeIcon icon={faMinus} className="w-3 h-3" />
                                                </button>
                                                <span className="text-base font-medium w-10 text-center">
                                                    {displayItem.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(displayItem.productId, displayItem.quantity + 1)}
                                                    disabled={isProcessing || processingRef.current}
                                                    className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-sm hover:bg-gray-300 transition-colors disabled:opacity-50"
                                                >
                                                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Item Total & Remove */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-medium text-lg text-gray-900">
                                                ${(displayItem.price * displayItem.quantity).toFixed(2)}
                                            </p>
                                            <button
                                                onClick={() => removeFromCart(displayItem.productId, true)}
                                                disabled={isProcessing || processingRef.current}
                                                className="mt-2 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payment Section */}
                    {displayCart.length > 0 && (
                        <div className="border-t bg-white p-6 space-y-6">
                            {/* Total */}
                            <div className="flex justify-between items-center text-xl font-semibold text-gray-900 border-t pt-4">
                                <span>Total ({itemCount} items):</span>
                                <span>${totalValue.toFixed(2)} USD</span>
                            </div>

                            {/* Clear Cart Button */}
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to clear your cart?')) {
                                        clearCart();
                                        setPaymentError(null);
                                        setPaymentSuccess(false);
                                        setButtonsKey(prev => prev + 1);
                                    }
                                }}
                                disabled={isProcessing || processingRef.current}
                                className="w-full py-3 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Clear Cart
                            </button>

                            {/* PayPal Buttons Container */}
                            <div ref={paypalContainerRef} className="paypal-button-container">
                                {paymentError && (
                                    <button
                                        onClick={handleRetryPayment}
                                        className="w-full mb-4 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Try Payment Again
                                    </button>
                                )}

                                {isResolved && buttonsReady && !paymentSuccess ? (
                                    <div key={`paypal-buttons-${buttonsKey}-${totalValue}`}>
                                        <PayPalButtons
                                            {...paypalButtonOptions}
                                            forceReRender={[buttonsKey, totalValue]}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg">
                                        <Spinner size="lg" />
                                        <span className="ml-4 text-sm text-gray-600">
                                            {isProcessing || processingRef.current ? 'Processing payment...' :
                                                paymentSuccess ? 'Payment completed!' :
                                                    isPending ? 'Loading PayPal...' :
                                                        'Initializing PayPal...'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Security Notice */}
                            <div className="text-center pb-2">
                                <p className="text-xs text-gray-500">🔒 Secure payment powered by PayPal</p>
                                <p className="text-xs text-gray-400 mt-1">Your payment information is encrypted and secure</p>
                                {(isProcessing || processingRef.current) && (
                                    <p className="text-xs text-blue-500 mt-1 font-medium">
                                        ⚠️ Do not close this window during payment processing
                                    </p>
                                )}
                            </div>

                            {/* Extra space for PayPal forms */}
                            <div className="h-40 w-full"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}