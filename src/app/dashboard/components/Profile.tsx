import { User } from "@/lib/definitions";
import { addUsersWallet } from "@/lib/themiracle";
import type { Provider } from "@reown/appkit-adapter-solana";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { memo, useCallback, useState } from "react";

function Profile(user: User) {
    const { address } = useAppKitAccount();
    const { connection } = useAppKitConnection();
    const { walletProvider } = useAppKitProvider<Provider>('solana');

    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [isSigningMessage, setIsSigningMessage] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);

    const getBalance = useCallback(async () => {
        if (isLoadingBalance) return;

        console.log('getting balance')
        setIsLoadingBalance(true);
        try {
            if (!walletProvider || !address) {
                throw Error('user is disconnected')
            }
            if (connection && walletProvider.publicKey) {
                const balanceResult = await connection.getBalance(walletProvider.publicKey)
                console.log(balanceResult)
                setBalance(balanceResult);

                await addUsersWallet(user.id, walletProvider.publicKey.toBase58(), 'solana')
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoadingBalance(false);
        }
    }, [walletProvider, address, connection, user.id, isLoadingBalance]);

    const onSignMessage = useCallback(async () => {
        if (isSigningMessage) return;

        console.log('signing message')
        setIsSigningMessage(true);
        try {
            if (!walletProvider || !address) {
                throw Error('user is disconnected')
            }

            // 2. Encode message and sign it
            const encodedMessage = new TextEncoder().encode('Hello from Themiracle')
            const signature = await walletProvider.signMessage(encodedMessage)
            console.log(signature)
        } catch (err) {
            console.error(err)
        } finally {
            setIsSigningMessage(false);
        }
    }, [walletProvider, address, isSigningMessage]);

    return (
        <div className="h-screen flex flex-1 flex-col justify-center align-middle">
            <h1 className="self-center text-3xl mb-6">Profile</h1>
            <div className="flex flex-col justify-center align-middle space-y-4">
                <h2 className="self-center text-xl">{user.name}</h2>
                <h2 className="self-center text-lg">Email: {user.email}</h2>

                {balance !== null && (
                    <p className="self-center text-sm text-gray-600">
                        Balance: {balance / 1000000000} SOL
                    </p>
                )}

                <div className="flex flex-col space-y-2 mt-4">
                    <button
                        onClick={onSignMessage}
                        disabled={isSigningMessage || !walletProvider || !address}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                        {isSigningMessage ? 'Signing...' : 'Sign Message'}
                    </button>

                    <button
                        onClick={getBalance}
                        disabled={isLoadingBalance || !walletProvider || !address}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                        {isLoadingBalance ? 'Loading...' : 'Get Balance'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default memo(Profile);