import "server-only";

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    // https://github.com/stripe/stripe-node#configuration
    apiVersion: "2024-09-30.acacia",
    appInfo: {
        name: "themiracle Company",
        url: "https://themiracle.love",
    },
});