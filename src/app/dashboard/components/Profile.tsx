import { User } from "@/lib/definitions";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import type { Provider } from "@reown/appkit-adapter-solana";

import { addUsersWallet } from "@/lib/themiracle";


export default function Profile(user: User) {
    const { address } = useAppKitAccount();
    const { connection } = useAppKitConnection();
    const { walletProvider } = useAppKitProvider<Provider>('solana');
    async function getBalance() {
        try {
            if (!walletProvider || !address) {
                throw Error('user is disconnected')
            }
            if (connection && walletProvider.publicKey) {
                const balance = await connection.getBalance(walletProvider.publicKey)
                console.log(balance)

                addUsersWallet(user.id, walletProvider.publicKey.toBase58(), 'solana')
            }
        } catch (err) {
            // Handle Error Here
        }
    }
    async function onSignMessage() {
        try {
            if (!walletProvider || !address) {
                throw Error('user is disconnected')
            }

            // 2. Encode message and sign it
            const encodedMessage = new TextEncoder().encode('Hello from Themiracle')
            const signature = await walletProvider.signMessage(encodedMessage)
            console.log(signature)
        } catch (err) {
            // Handle Error Here
        }
    }
    return (
        <div className="flex flex-1 flex-col justify-center align-middle">
            <h1 className="self-center text-3xl">Profile</h1>
            <div className="flex flex-col justify-center align-middle">
                <h2 className="self-center">{user.name}</h2>
                <h2 className="self-center">Email:{user.email}</h2>
                <button onClick={onSignMessage}>sign message</button>
                <button onClick={getBalance}>get balance</button>
            </div>
        </div>
    )
}