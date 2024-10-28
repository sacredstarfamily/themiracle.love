"use client";
import Navbar from "./components/Navbar";
import { useAccount } from "wagmi";
import Footer from "./components/Footer";

export default function Home() {
  const { isConnected } = useAccount();
  return (
    <>
      <Navbar />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-cheri)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <h1 className="text-4xl sm:text-6xl font-[family-name:var(--font-cheri)]">
            Connect To Your Wallet
          </h1>
          <w3m-button />
          <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-cheri)]">
            <li className="mb-2">
              Life can be very hard and alot of people are suffering .
            </li>
            <li>Help the world by creating art and supporting artists</li>
          </ol>

          <div className="flex gap-4 items-center flex-col sm:flex-row"></div>
          {isConnected ? (
            <div className="text-center text-2xl">
              <p>Connected </p>
            </div>
          ) : null}
        </main>
      </div>
      <Footer />
    </>
  );
}
