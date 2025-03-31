"use client";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Home() {

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center h-screen text-center z-1">
        <h1 className="text-4xl sm:text-5xl self-center font-[family-name:var(--font-cheri)]">
          Welcome to themiracle.love
        </h1>
        <p className="text-lg text-center self-center sm:text-2xl">
          Create art, mint NFTs, discover artists, learn about blockchain, and more!
        </p>

        <div className="border-2 border-black p-0  m-auto rounded-lg">
          <h1 className="text-4xl">themiracle token</h1>
          <p>available at <a href="https://pump.fun/coin/DakAndRzPaLjUSZYSapvZFKWuGoZXu84UUopWFfypump"><span className="font-[family-name:var(--font-cheri)] text-blue-600 underline cursor-pointer">pump.fun</span></a></p>
        </div>
      </main>
      <Footer />
    </>
  );
}
