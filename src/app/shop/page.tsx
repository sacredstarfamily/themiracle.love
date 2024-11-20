'use client';

import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js";
import { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";
import { PayPalButtonsComponentOptions } from "@paypal/paypal-js/types/components/buttons";

export default function ShopPage() {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string;
    const initialOptions: PayPalScriptOptions = {
        clientId: clientId,
        currency: 'USD',

    }
    function PayButton() {
        const [{ isPending }] = usePayPalScriptReducer();
        const buttonStyles: PayPalButtonsComponentOptions = {
            style: {
                color: "gold",
                shape: "rect",
                label: "pay",
                height: 40,
            },
            createOrder: (data, actions) => {
                console.log(data)
                return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            amount: {
                                currency_code: "USD",
                                value: "0.01",
                            },
                        },
                    ],
                });
            },
            onApprove: async (data, actions) => {
                return actions.order?.capture().then((details) => {
                    alert(
                        "Transaction completed by " +
                        (details?.payer?.name?.given_name ?? "No details")
                    );

                    alert("Data details: " + JSON.stringify(data, null, 2));
                });
            }

        }
        return (
            <>
                <h2>{isPending ? "Loading PayPal..." : "Pay with PayPal"}</h2>
                <PayPalButtons {...buttonStyles} />
            </>
        );
    }
    return (
        <>
            <PayPalScriptProvider
                options={initialOptions}
            >
                <PayButton />
               
            </PayPalScriptProvider>
        </>
    )
}