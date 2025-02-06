import { useAppKit } from '@reown/appkit/react'
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect } from 'react';
export default function ConnectButton() {
    // 4. Use modal hook
    const { isConnected } = useAppKitAccount();
    const { open } = useAppKit();
    useEffect(() => {
        if (isConnected) {
            console.log('Connected');
        }
    }, [isConnected]);

    return (
        <>

            <li><button onClick={() => open()}>{isConnected ? (<p>View Wallet</p>) : (<p>ConnectWallet</p>)}</button></li>
            <li><button onClick={() => open({ view: 'Networks' })}>Choose Network</button></li>
        </>
    )
}