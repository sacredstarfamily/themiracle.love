import localFont from "next/font/local";
import { headers } from "next/headers";
import ContextProvider from "./context/index";
import PayPalProvider from "./context/paypal-provider";
import "./globals.css";

import "../lib/fontawesome";

const cheri = localFont({
  src: "./fonts/cheri.ttf",
  variable: "--font-cheri",
  weight: "100 900",
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = headers().get("cookie");

  return (
    <html lang="en" className="h-full bg-pink-300 p-0 m-0">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Preload the cheri font for better performance */}
        <link
          rel="preload"
          href="/fonts/cheri.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            html {
              scroll-behavior: smooth;
              scroll-padding-top: 4rem;
            }
            
            body {
              padding-top: env(safe-area-inset-top, 0);
            }
            
            * {
              box-sizing: border-box;
            }
          `
        }} />
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${cheri.variable} antialiased`}
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        {/* Load Facebook SDK on the client by injecting the script only in the browser */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
})(document, 'script', 'facebook-jssdk');`,
          }}
        />

        <PayPalProvider>
          <ContextProvider cookies={cookies}>{children}</ContextProvider>
        </PayPalProvider>
      </body>
    </html>
  );
}
