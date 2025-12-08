import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });

export async function POST(req: NextRequest) {


    try {
        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            line_items: [
                {
                    // Provide the exact Price ID (for example, pr_1234) of
                    // the product you want to sell
                    price: 'price_1QL78vHO7xzOaaqKUQVTSwpE',
                    quantity: 1,
                },
            ],
            mode: 'payment',
            return_url:
                `${req.headers.get('origin')}/return?session_id={CHECKOUT_SESSION_ID}`,
        });

        return NextResponse.json({ clientSecret: session.client_secret });
    } catch (err) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: (err as Stripe.errors.StripeAPIError).statusCode || 500 });
        }
        return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
    }
}
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const sessionId = url.searchParams.get('session_id');
        const session =
            await stripe.checkout.sessions.retrieve(sessionId as string);

        return NextResponse.json({
            status: session.status,
            customer_email: session.customer_details?.email
        });
    } catch (err) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: (err as Stripe.errors.StripeAPIError).statusCode || 500 });
        }
        return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
    }

}
