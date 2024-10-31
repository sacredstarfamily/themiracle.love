import localFont from "next/font/local";
import "./globals.css";
import { headers } from "next/headers";
import ContextProvider from "./context/index";
/* const waltoGraph = localFont({
  src: "./fonts/waltograph42.ttf",
  variable: "--font-walto-graph",
  weight: "100 900",
}); */
const cheri = localFont({
  src: "./fonts/cheri.ttf",
  variable: "--font-cheri",
  weight: "100 900",
});

/*
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
*/
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = headers().get("cookie");

  return (
    <html lang="en" className="h-full bg-pink-300 p-0 m-0">
      <body className={`${cheri.variable} ${cheri.variable} antialiased`}>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  );
}
