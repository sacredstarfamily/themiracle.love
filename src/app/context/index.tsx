"use client";

import React, { type ReactNode } from "react";
import { wagmiAdapter, projectId, solanaWeb3JsAdapter } from "../config/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import {
  mainnet,
  sepolia,
  solana,
  solanaDevnet,
  solanaTestnet,
} from "@reown/appkit/networks";

import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

const queryClient = new QueryClient();
if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not set");
}
export const metadata = {
  name: "themiracle",
  description: "themiracle community",
  url: "https://themiracle.love",
  icons: ['https://themiracle.love/favicon.ico']
};
export const modal = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  networks: [mainnet, sepolia, solana, solanaDevnet, solanaTestnet],
  projectId,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    email: true, // Optional - defaults to your Cloud configuration
    socials: ["x"], // Optional - defaults to your Cloud configuration
    emailShowWallets: true,
  },
  themeMode: "light",
  themeVariables: {
    "--w3m-color-mix": "#000000",
    "--w3m-color-mix-strength": 30,
    "--w3m-accent": "#000000",
  },
});

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies,
  );
  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
export default ContextProvider;
