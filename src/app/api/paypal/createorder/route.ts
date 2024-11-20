import client from "@/lib/paypal";

import { NextRequest, NextResponse } from "next/server";
import { CheckoutPaymentIntent, OrdersController } from "@paypal/paypal-server-sdk";


export async function POST(req: NextRequest) {
    const reqBody = await req.json();
    console.log(reqBody);
    const collect = {
        body: {
            intent: CheckoutPaymentIntent.Capture,
            purchaseUnits: [
                {
                    amount: {
                        currencyCode: "USD",
                        value: "100.00",
                    },
                },
            ],
        },
        prefer: "return=minimal",
    };
    try {


        const PaypalClient = client;

        const ordersController = new OrdersController(PaypalClient);

        const { body, ...httpResponse } = await ordersController.ordersCreate(collect);
        console.log('ruunn');
        console.log(body);
        console.log(httpResponse);
        return NextResponse.json(body);
    } catch (error) {
        console.log("k  ");
        return NextResponse.json({ error: "yup" });
    }
}