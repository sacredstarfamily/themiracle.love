import {cookieStorage, createStorage} from 'wagmi';
import {WagmiAdapter} from '@reown/appkit-adapter-wagmi';
import {mainnet, sepolia, solana} from '@reown/appkit/networks';
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set');
}
export const networks = [mainnet, sepolia, solana];

export const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks,
    ssr: true,
    storage: createStorage({
        storage: cookieStorage
    })
});
export const config = wagmiAdapter.wagmiConfig
