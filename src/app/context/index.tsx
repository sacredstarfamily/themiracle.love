'use client';

import React, { type ReactNode } from 'react';
import { wagmiAdapter, projectId } from '../config/index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import {mainnet, sepolia} from '@reown/appkit/networks';

import {cookieToInitialState, WagmiProvider, type Config} from 'wagmi';


const queryClient = new QueryClient();
if(!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not set');
}
export const metadata = {
    name: 'themiracle',
    description: 'themiracle community',
    
}
export const modal = createAppKit({
    adapters: [wagmiAdapter],
    networks: [mainnet, sepolia],
    projectId,
    features: {
        analytics: true, // Optional - defaults to your Cloud configuration
        email: true, // Optional - defaults to your Cloud configuration  
        socials: ['x'], // Optional - defaults to your Cloud configuration  
        emailShowWallets: true
    },
    themeMode: 'dark'
});

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string| null }) {
    const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
export default ContextProvider;