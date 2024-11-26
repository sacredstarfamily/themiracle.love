'use client';

import {
    PayPalScriptProvider,
    PayPalButtons,

} from "@paypal/react-paypal-js";
import { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";
import { PayPalButtonsComponentOptions } from "@paypal/paypal-js/types/components/buttons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ShopPage() {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string;
    const initialOptions: PayPalScriptOptions = {
        clientId: clientId,
        currency: 'USD',

    }
    function PayButton() {

        const buttonStyles: PayPalButtonsComponentOptions = {
            style: {
                color: "gold",
                shape: "pill",
                label: "donate",
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
                                value: "1",
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
            <div className="z-0" id="button-block">
                <h2>Donate to themmiracle</h2>
                <PayPalButtons {...buttonStyles} />
            </div>
        );
    }
    return (
        <>
            <Navbar />
            <div className="h-screen flex-1 justify-center text-center z-1">
                <PayPalScriptProvider
                    options={initialOptions}
                >
                    <PayButton />

                </PayPalScriptProvider>
            </div>
            <Footer />
        </>
    )
}