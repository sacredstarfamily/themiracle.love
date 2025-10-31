import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
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
            <li className="text-base cursor-pointer" onClick={() => open()}>{isConnected ? (<p>View Wallet</p>) : (<p>ConnectWallet</p>)}</li>
            <li className="text-base cursor-pointer" onClick={() => open({ view: 'Networks' })}>Choose Network</li>
        </>
    )
}