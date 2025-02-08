"use client";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";


export default function Home() {

  return (
    <>
      <Navbar />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-cheri)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <h1 className="text-4xl sm:text-5xl self-center font-[family-name:var(--font-cheri)]">
            Welcome to themiracle.love 🌈
          </h1>

          <p className="text-lg text-center self-center sm:text-2xl">
            Create art, mint NFTs, discover artists, learn about blockchain, and more!
          </p>

          <div className="border-2 border-black p-0 w-1/2 m-auto rounded-lg">
            <h1 className="text-4xl">themiracle token</h1>
            <p>available at <a href="https://pump.fun/coin/DakAndRzPaLjUSZYSapvZFKWuGoZXu84UUopWFfypump"><span className="font-[family-name:var(--font-cheri)] text-blue-500 underline cursor-pointer">pump.fun</span></a></p>
          </div>

          <div className="flex gap-4 items-center flex-col sm:flex-row"></div>

        </main>
      </div>
      <Footer />
    </>
  );
}
