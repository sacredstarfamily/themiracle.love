import {cookieStorage, createStorage} from 'wagmi';
import {WagmiAdapter} from '@reown/appkit-adapter-wagmi';
import {mainnet, sepolia, solana, solanaTestnet, solanaDevnet} from '@reown/appkit/networks';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set');
}
export const networks = [mainnet, sepolia, solana, solanaTestnet, solanaDevnet];
export const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
});

export const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks,
    ssr: true,
    storage: createStorage({
        storage: cookieStorage
    })
});
export const config = wagmiAdapter.wagmiConfig
