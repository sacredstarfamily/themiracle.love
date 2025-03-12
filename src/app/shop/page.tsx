'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PaypalCard from "./shop-components/PaypalCard";
import PayButton from "./shop-components/PayButton";
import { PayPalInterface } from "@/actions/paypalActions";
import { useEffect, useMemo } from "react";

export default function ShopPage() {

    const clientId = process.env.NEXT_PUBLIC_LIVE_PAYPAL_ID as string;
    const initialOptions: PayPalScriptOptions = {
        clientId: clientId,
        currency: 'USD',
    }
    const paypalMemo = useMemo(() => {
        const paypal = new PayPalInterface();
        const products = paypal.getItems();
        console.log(products);
        return products;
    }, []);

    useEffect(() => {
        paypalMemo;
    }, [paypalMemo]);
    return (
        <>
            <Navbar />
            <div className="h-screen flex-1 justify-center text-center z-1">
                <div className="border-2 border-black p-0 w-1/2 m-auto rounded-lg">
                    <h1 className="text-4xl">themiracle token</h1>
                    <p>available at <a href="https://pump.fun/coin/DakAndRzPaLjUSZYSapvZFKWuGoZXu84UUopWFfypump"><span className="font-[family-name:var(--font-cheri)] text-blue-500 underline cursor-pointer">pump.fun</span></a></p>
                </div>
                <PayPalScriptProvider options={initialOptions}>
                    <PayButton />
                    <div className="border-2 border-black p-0 w-1/2 m-auto rounded-lg">

                    </div>
                    <PaypalCard />
                </PayPalScriptProvider>
            </div >
            <Footer />
        </>
    )
}