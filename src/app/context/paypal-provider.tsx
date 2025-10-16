"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

interface PayPalProviderProps {
    children: ReactNode;
}

const isDevelopment = process.env.NODE_ENV === 'development';

const initialOptions = {
    clientId: isDevelopment
        ? process.env.NEXT_PUBLIC_SANDBOX_PAYPAL_ID!
        : process.env.NEXT_PUBLIC_LIVE_PAYPAL_ID!,
    currency: "USD",
    intent: "capture" as const,
    components: "buttons,messages",
    enableFunding: "venmo,paylater",
    disableFunding: "",
    dataClientToken: undefined,
    vault: false,
    commit: true,
    locale: "en_US",
    // Disable debug mode to reduce console logging
    debug: false,
    // Add these options to prevent zoid destruction
    "disable-funding": "",
    "enable-funding": "venmo,paylater",
};

export default function PayPalProvider({ children }: PayPalProviderProps) {
    return (
        <PayPalScriptProvider
            options={initialOptions}
            deferLoading={false}
        >
            {children}
        </PayPalScriptProvider>
    );
}
