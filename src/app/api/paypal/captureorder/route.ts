import { NextRequest, NextResponse } from "next/server";
import { OrdersController } from "@paypal/paypal-server-sdk";
import client from '@/lib/paypal';






export async function POST(req: NextRequest) {
    const ordersController = new OrdersController(client);

    const body = await req.json();
    const orderID = body?.orderID;
    const collect = {
        id: orderID,
        prefer: "return=minimal",
    };
    //const capture = await paypalClient.execute(request);
    try {
        /*        const PaypalClient = client();
               const request = new paypal.orders.OrdersCaptureRequest(orderID);
               request.requestBody({});
               const response = await PaypalClient.execute(request);
        */
        const { body, ...httpResponse } = await ordersController.ordersCapture(collect);
        return NextResponse.json(body, httpResponse);
    } catch (error) {
        return NextResponse.json(error);
    }
}