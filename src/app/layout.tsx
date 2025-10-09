import localFont from "next/font/local";
import { headers } from "next/headers";
import ContextProvider from "./context/index";
import PayPalProvider from "./context/paypal-provider";
import "./globals.css";

const cheri = localFont({
  src: "./fonts/cheri.ttf",
  variable: "--font-cheri",
  weight: "100 900",
  display: 'swap',
});


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = headers().get("cookie");

  return (
    <html lang="en" className="h-full bg-pink-300 p-0 m-0">
      <body suppressHydrationWarning={true} className={`${cheri.variable} ${cheri.variable} antialiased`}>
        <PayPalProvider>
          <ContextProvider cookies={cookies}>{children}</ContextProvider>
        </PayPalProvider>
      </body>
    </html>
  );
}
