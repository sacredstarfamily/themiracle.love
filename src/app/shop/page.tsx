'use client';

import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
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
    function PrintLoadingState() {
        const [{ isInitial, isPending, isResolved, isRejected }] =
            usePayPalScriptReducer();
        let status = "no status";

        if (isInitial) {
            status = "initial";
        } else if (isPending) {
            status = "pending";
        } else if (isResolved) {
            status = "resolved";
        } else if (isRejected) {
            status = "rejected";
        }

        return <div>Current status: {status} </div>;
    }
    function PayButton() {
        const [{ isInitial, isPending, isResolved, isRejected }] =
            usePayPalScriptReducer();
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

                    alert("Data details: " + JSON.stringify(data, null, 2));
                });
            }

        }
        return (
            <div className="z-0" id="button-block">
                {isResolved ?
                    <> <h2>Donate 100$ to themiracle.love</h2>
                        <PayPalButtons {...buttonStyles} /></> : <><p>loading...</p></>
                }
            </div>
        );
    }
    return (
        <>
            <Navbar />
            <div className="h-screen flex-1 justify-center text-center z-1">
                <div className="border-2 border-black p-0 w-1/2 m-auto rounded-lg">
                    <h1 className="text-4xl">themiracle token</h1>
                    <p>available at <a href="https://pump.fun/coin/DakAndRzPaLjUSZYSapvZFKWuGoZXu84UUopWFfypump"><span className="font-[family-name:var(--font-cheri)] text-blue-500 underline cursor-pointer">pump.fun</span></a></p>
                </div>
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