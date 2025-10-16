'use client';
import { Spinner } from "@/components/icons";
import { PayPalButtonsComponentOptions } from "@paypal/paypal-js/types/components/buttons";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useCallback, useState } from "react";

export default function PayButton() {
    const [{ isResolved, isPending }] = usePayPalScriptReducer();
    const [isProcessing, setIsProcessing] = useState(false);
    const [buttonsKey, setButtonsKey] = useState(0);

    const handleError = useCallback(() => {
        setIsProcessing(false);
        setButtonsKey(prev => prev + 1); // Force new buttons on error
    }, []);

    const buttonStyles: PayPalButtonsComponentOptions = {
        style: {
            color: "gold",
            shape: "pill",
            label: "donate",
            disableMaxWidth: true,
            height: 25,
        },
        createOrder: (data, actions) => {
            if (isProcessing) {
                throw new Error("Order creation already in progress");
            }

            setIsProcessing(true);
            // Reduced logging
            console.log("Creating donation order");

            return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                            value: "100",
                        },
                    },
                ],
            });
        },
        onApprove: async (data, actions) => {
            try {
                const details = await actions.order?.capture();
                alert(
                    "Transaction completed by " +
                    (details?.payment_source?.paypal?.name?.given_name ?? "No details")
                );
            } catch (error) {
                console.error("Donation capture error:", error);
                alert("There was an error processing your donation. Please try again.");
            } finally {
                setIsProcessing(false);
            }
        },
        onError: (error) => {
            console.error("PayPal donation error:", error);
            handleError();
        },
        onCancel: () => {
            // Reduced logging
            console.log("Donation cancelled");
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col align-middle justify-center">
            {isResolved && !isPending ? (
                <div className="w-1/2 mx-auto text-center">
                    <h1>Donate to themiracle</h1>
                    <div key={buttonsKey}>
                        <PayPalButtons {...buttonStyles} />
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center">
                    <Spinner />
                    <span className="ml-2 text-sm">Loading PayPal donation button...</span>
                </div>
            )}
        </div>
    );
}