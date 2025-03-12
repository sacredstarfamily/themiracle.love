'use client';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { PayPalButtonsComponentOptions } from "@paypal/paypal-js/types/components/buttons";



export default function PayButton() {

    const [{ isResolved }] = usePayPalScriptReducer();
    const buttonStyles: PayPalButtonsComponentOptions = {
        style: {
            color: "gold",
            shape: "pill",
            label: "donate",
            disableMaxWidth: true,
            height: 25,
        },
        createOrder: (data, actions) => {
            console.log(data)
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
            return actions.order?.capture().then((details) => {
                alert(
                    "Transaction completed by " +
                    (details?.payment_source?.paypal?.name?.given_name ?? "No details")
                );
            });
        },
    };
    return (
        <div className="flex flex-col align-middle  justify-center">
            {isResolved ? (
                <div className="w-1/2 mx-auto text-center">
                    <h1>Pay With Paypal</h1>
                    <PayPalButtons {...buttonStyles} />
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    )
}