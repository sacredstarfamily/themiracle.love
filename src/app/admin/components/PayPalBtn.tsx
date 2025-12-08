'use client';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";



export default function PayPalBtn(id: string) {

    const [{ isResolved }] = usePayPalScriptReducer();
    const buttonStyles = {
        style: {
            color: "gold" as const,
            shape: "pill" as const,
            label: "donate" as const,
            disableMaxWidth: true,
            height: 35,
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
                        items: [
                            {
                                name: "",
                                unit_amount: {
                                    currency_code: "USD",
                                    value: ""
                                },
                                quantity: "",
                                sku: id,

                            }
                        ]
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