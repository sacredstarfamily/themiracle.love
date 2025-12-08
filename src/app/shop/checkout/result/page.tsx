import PrintObject from "@/app/components/PrintObject";
import { stripe } from "@/lib/stripe";
import type { Stripe } from "stripe";

// Define PageProps type locally for route parameters
type PageProps = {
  searchParams: Promise<{ session_id: string }>;
};

export default async function ResultPage({
  searchParams,
}: PageProps): Promise<JSX.Element> {
  const resolvedSearchParams = await searchParams;

  if (!resolvedSearchParams.session_id) {
    throw new Error("Please provide a valid session_id (`cs_test_...`)");
  }

  const checkoutSession: Stripe.Checkout.Session =
    await stripe.checkout.sessions.retrieve(resolvedSearchParams.session_id, {
      expand: ["line_items", "payment_intent"],
    });

  const paymentIntent = checkoutSession.payment_intent as Stripe.PaymentIntent;

  return (
    <>
      <h2>Status: {paymentIntent.status}</h2>
      <h3>Checkout Session response:</h3>
      <PrintObject content={checkoutSession} />
    </>
  );
}