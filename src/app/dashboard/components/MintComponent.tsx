'use client';
import type { Provider } from "@reown/appkit-adapter-solana";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {
    ConfirmOptions,
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    Transaction,
    TransactionInstruction
} from "@solana/web3.js";
import BN from "bn.js";
import { memo, useCallback, useState } from "react";

const FRIKEN_SWEET_PROGRAM_ID = "3YNNGxXYc8SJsUAizUWcFnTZowJ1krZjtk6jtFWsxJjn";

// Based on typical Anchor program discriminators - these are likely 8-byte SHA256 hashes
const INSTRUCTION_DISCRIMINATORS = {
    // Common Anchor instruction discriminators for NFT programs
    INITIALIZE: Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]), // initialize
    CREATE_COLLECTION: Buffer.from([156, 251, 92, 54, 233, 2, 16, 52]), // create_collection  
    MINT_NFT: Buffer.from([211, 57, 6, 167, 15, 219, 35, 251]), // mint_nft
};

interface TokenMetadata {
    name: string;
    symbol: string;
    description: string;
    image: string;
    attributes: Array<{
        trait_type: string;
        value: string;
    }>;
    external_url?: string;
    animation_url?: string;
    token_name?: string;
}

function MintComponent() {
    const { address } = useAppKitAccount();
    const { connection } = useAppKitConnection();
    const { walletProvider } = useAppKitProvider<Provider>('solana');

    const [isMinting, setIsMinting] = useState(false);
    const [isCreatingMint, setIsCreatingMint] = useState(false);
    const [mintAddress, setMintAddress] = useState<string>('');
    const [recipient, setRecipient] = useState<string>('');

    // New state for friken_sweet contract
    const [collectionName, setCollectionName] = useState<string>('');
    const [collectionSymbol, setCollectionSymbol] = useState<string>('');

    // Metadata form fields
    const [metadata, setMetadata] = useState<TokenMetadata>({
        name: '',
        symbol: '',
        description: '',
        image: '',
        attributes: [],
        external_url: '',
        animation_url: '',
        token_name: ''
    });


    // Add a function to derive program PDAs (Program Derived Addresses)
    const deriveProgramAddresses = useCallback((authority: PublicKey, collectionName: string) => {
        const programId = new PublicKey(FRIKEN_SWEET_PROGRAM_ID);

        // Common PDA patterns for NFT programs
        const [collectionPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("collection"),
                authority.toBuffer(),
                Buffer.from(collectionName.slice(0, 32))
            ],
            programId
        );

        const [metadataPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                collectionPda.toBuffer()
            ],
            programId
        );

        return { collectionPda, metadataPda };
    }, []);

    const createFrikenSweetCollection = useCallback(async () => {
        if (!walletProvider || !address || !connection) {
            throw new Error('Wallet not connected');
        }

        if (!walletProvider.publicKey) {
            throw new Error('Wallet public key not available');
        }

        if (!collectionName || !collectionSymbol) {
            throw new Error('Collection name and symbol are required');
        }

        setIsCreatingMint(true);
        try {
            const programId = new PublicKey(FRIKEN_SWEET_PROGRAM_ID);
            const authority = walletProvider.publicKey;

            // Validate wallet connection more thoroughly
            if (!authority || !PublicKey.isOnCurve(authority)) {
                throw new Error('Invalid wallet public key. Please reconnect your wallet.');
            }

            // Check wallet balance
            const balance = await connection.getBalance(authority);
            console.log("Wallet balance:", balance / 1e9, "SOL");

            if (balance < 0.01 * 1e9) {
                throw new Error("Insufficient SOL balance. Need at least 0.01 SOL for transaction fees.");
            }

            // Derive PDAs
            const { collectionPda, metadataPda } = deriveProgramAddresses(authority, collectionName);
            console.log("Collection PDA:", collectionPda.toString());

            // Check if collection already exists
            const collectionAccountInfo = await connection.getAccountInfo(collectionPda);
            if (collectionAccountInfo) {
                throw new Error("Collection with this name already exists");
            }

            // Prepare instruction data
            const nameBytes = new Uint8Array(32);
            const nameBuffer = Buffer.from(collectionName.slice(0, 32), 'utf8');
            nameBytes.set(nameBuffer);

            const symbolBytes = new Uint8Array(10);
            const symbolBuffer = Buffer.from(collectionSymbol.slice(0, 10), 'utf8');
            symbolBytes.set(symbolBuffer);

            const descriptionBytes = new Uint8Array(200);
            const descBuffer = Buffer.from((metadata.description || collectionName).slice(0, 200), 'utf8');
            descriptionBytes.set(descBuffer);

            const imageBytes = new Uint8Array(200);
            const imageBuffer = Buffer.from((metadata.image || "").slice(0, 200), 'utf8');
            imageBytes.set(imageBuffer);

            const instructionData = new Uint8Array([
                ...new Uint8Array(INSTRUCTION_DISCRIMINATORS.CREATE_COLLECTION),
                ...nameBytes,
                ...symbolBytes,
                ...descriptionBytes,
                ...imageBytes,
                ...new Uint8Array(new BN(1000).toArray('le', 8)),
                ...new Uint8Array(new BN(0).toArray('le', 8))
            ]);

            // Get fresh blockhash
            console.log("Getting latest blockhash...");
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
            console.log("Got blockhash:", blockhash);

            // Create instruction
            const createInstruction = new TransactionInstruction({
                keys: [
                    { pubkey: authority, isSigner: true, isWritable: true },
                    { pubkey: collectionPda, isSigner: false, isWritable: true },
                    { pubkey: metadataPda, isSigner: false, isWritable: true },
                    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
                ],
                programId,
                data: Buffer.from(instructionData)
            });

            // Create transaction
            console.log("Creating transaction...");
            const transaction = new Transaction();

            // Set transaction properties BEFORE adding instructions
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = authority;

            // Add instruction AFTER setting properties
            transaction.add(createInstruction);

            console.log("Transaction created, sending directly...");

            // Sign and send transaction directly without simulation
            if (!walletProvider.signAndSendTransaction) {
                throw new Error('Wallet does not support transaction signing. Please try a different wallet.');
            }

            let signature: string;
            try {
                signature = await walletProvider.signAndSendTransaction(transaction);
                console.log("Transaction sent with signature:", signature);

                if (!signature) {
                    throw new Error('Transaction signing returned empty signature');
                }

            } catch (signError) {
                console.error("Signing error:", signError);

                if (signError instanceof Error) {
                    const errorMessage = signError.message.toLowerCase();

                    if (errorMessage.includes('user rejected') || errorMessage.includes('denied')) {
                        throw new Error("Transaction was rejected by user");
                    } else if (errorMessage.includes('numrequiredsignatures') || errorMessage.includes('undefined')) {
                        throw new Error("Wallet connection error. Please disconnect and reconnect your wallet, then try again.");
                    } else if (errorMessage.includes('blockhash')) {
                        throw new Error("Transaction expired. Please try again with a fresh transaction.");
                    } else {
                        throw new Error(`Transaction signing failed: ${signError.message}`);
                    }
                }
                throw new Error("Unknown error occurred during transaction signing");
            }

            // Wait for confirmation
            try {
                const confirmOptions: ConfirmOptions = { commitment: 'confirmed' };
                const confirmation = await Promise.race([
                    connection.confirmTransaction({
                        signature,
                        blockhash,
                        lastValidBlockHeight
                    }, confirmOptions.commitment),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error("Transaction confirmation timeout")), 30000)
                    )
                ]);

                if (confirmation.value.err) {
                    throw new Error(`Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`);
                }

                console.log('Collection created successfully:', signature);
                setMintAddress(collectionPda.toString());

                return {
                    signature,
                    collectionPda: collectionPda.toString(),
                    metadataPda: metadataPda.toString()
                };

            } catch (confirmError) {
                console.error("Confirmation error:", confirmError);
                throw new Error(`Transaction confirmation failed: ${confirmError instanceof Error ? confirmError.message : 'Unknown error'}`);
            }

        } catch (error) {
            console.error('Error creating collection:', error);
            throw error;
        } finally {
            setIsCreatingMint(false);
        }
    }, [walletProvider, address, connection, collectionName, collectionSymbol, metadata, deriveProgramAddresses]);

    const mintToFrikenSweet = useCallback(async () => {
        if (!walletProvider || !address || !connection || !mintAddress || !recipient) {
            throw new Error('Missing required parameters');
        }

        if (!metadata.name) {
            throw new Error('NFT metadata name is required');
        }

        setIsMinting(true);
        try {
            const programId = new PublicKey(FRIKEN_SWEET_PROGRAM_ID);
            const authority = walletProvider.publicKey!;
            const collectionPda = new PublicKey(mintAddress);
            const recipientPubkey = new PublicKey(recipient);

            // Generate unique mint keypair
            const mintKeypair = new PublicKey(Buffer.from(Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))));

            // Derive token account
            const tokenAccount = await getAssociatedTokenAddress(
                mintKeypair,
                recipientPubkey
            );

            // Derive metadata PDA
            const [metadataPda] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("metadata"),
                    mintKeypair.toBuffer()
                ],
                programId
            );

            // Prepare NFT metadata using Uint8Array
            const nameBytes = new Uint8Array(32);
            const nameBuffer = Buffer.from(metadata.name.slice(0, 32), 'utf8');
            nameBytes.set(nameBuffer);

            const symbolBytes = new Uint8Array(10);
            const symbolBuffer = Buffer.from((metadata.symbol || "NFT").slice(0, 10), 'utf8');
            symbolBytes.set(symbolBuffer);

            const uriBytes = new Uint8Array(200);
            const uriBuffer = Buffer.from((metadata.image || "").slice(0, 200), 'utf8');
            uriBytes.set(uriBuffer);

            // Create mint instruction data using Uint8Array concatenation
            const mintInstructionData = new Uint8Array([
                ...new Uint8Array(INSTRUCTION_DISCRIMINATORS.MINT_NFT),
                ...nameBytes,
                ...symbolBytes,
                ...uriBytes
            ]);

            const transaction = new Transaction();

            // Add create associated token account instruction if needed
            const accountInfo = await connection.getAccountInfo(tokenAccount);
            if (!accountInfo) {
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                        authority, // payer
                        tokenAccount,
                        recipientPubkey, // owner
                        mintKeypair // mint
                    )
                );
            }

            // Add mint instruction
            const mintInstruction = new TransactionInstruction({
                keys: [
                    { pubkey: authority, isSigner: true, isWritable: true }, // payer/authority
                    { pubkey: collectionPda, isSigner: false, isWritable: true }, // collection
                    { pubkey: mintKeypair, isSigner: false, isWritable: true }, // mint
                    { pubkey: metadataPda, isSigner: false, isWritable: true }, // metadata
                    { pubkey: tokenAccount, isSigner: false, isWritable: true }, // token account
                    { pubkey: recipientPubkey, isSigner: false, isWritable: false }, // recipient
                    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token program
                    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // ata program
                    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system program
                    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }, // rent
                ],
                programId,
                data: Buffer.from(mintInstructionData)
            });

            transaction.add(mintInstruction);

            // Set transaction properties
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = authority;

            // Send transaction directly without simulation
            console.log('Sending NFT mint transaction...');
            const signature = await walletProvider.signAndSendTransaction(transaction);

            // Wait for confirmation
            const confirmOptions: ConfirmOptions = { commitment: 'confirmed' };
            const confirmation = await Promise.race([
                connection.confirmTransaction({
                    signature,
                    blockhash,
                    lastValidBlockHeight
                }, confirmOptions.commitment),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error("Transaction timeout")), 30000)
                )
            ]);

            if (confirmation.value.err) {
                throw new Error(`Mint failed: ${JSON.stringify(confirmation.value.err)}`);
            }

            console.log('NFT minted successfully:', signature);

            return {
                signature,
                nftMint: mintKeypair.toString(),
                tokenAccount: tokenAccount.toString(),
                metadataPda: metadataPda.toString(),
                nftId: Date.now()
            };

        } catch (error) {
            console.error('Error minting NFT:', error);
            throw error;
        } finally {
            setIsMinting(false);
        }
    }, [walletProvider, address, connection, mintAddress, recipient, metadata]);

    // Add a simple program test function
    const testProgramExists = useCallback(async () => {
        if (!connection) {
            return { exists: false, error: "No connection" };
        }

        try {
            const programId = new PublicKey(FRIKEN_SWEET_PROGRAM_ID);
            const accountInfo = await connection.getAccountInfo(programId);

            return {
                exists: !!accountInfo,
                executable: accountInfo?.executable || false,
                owner: accountInfo?.owner.toString() || 'none',
                dataLength: accountInfo?.data.length || 0
            };
        } catch (error) {
            return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }, [connection]);

    const handleCreateCollection = async () => {
        try {
            const result = await createFrikenSweetCollection();
            alert(`Collection created successfully!\nSignature: ${result.signature}\nCollection: ${result.collectionPda}`);
        } catch (error) {
            console.error('Create collection error:', error);
            alert('Failed to create collection: ' + (error as Error).message);
        }
    };

    const handleMintNFT = async () => {
        try {
            const result = await mintToFrikenSweet();
            alert(`NFT minted successfully!\nSignature: ${result.signature}\nNFT Mint: ${result.nftMint}\nNFT ID: ${result.nftId}`);
        } catch (error) {
            console.error('Mint NFT error:', error);
            alert('Failed to mint NFT: ' + (error as Error).message);
        }
    };

    if (!address || !walletProvider) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg">
                <p className="text-gray-600">Please connect your wallet to use minting features</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6 p-6 bg-white rounded-lg shadow-lg max-w-4xl w-full">
            <h2 className="text-2xl font-bold text-gray-800">Friken Sweet NFT Minting</h2>
            <p className="text-sm text-gray-600">Contract: {FRIKEN_SWEET_PROGRAM_ID}</p>

            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                    <strong>Updated:</strong> Using proper Anchor program structure with PDAs and correct instruction format
                </p>
            </div>

            {/* Debug Information */}
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <p className="text-xs text-gray-600">
                    <strong>Debug Info:</strong> Wallet: {address?.slice(0, 8)}...{address?.slice(-8)} |
                    Network: {connection ? 'Connected' : 'Disconnected'}
                </p>
            </div>

            {/* Collection Configuration */}
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3">Create NFT Collection</h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Collection Name *
                        </label>
                        <input
                            type="text"
                            value={collectionName}
                            onChange={(e) => setCollectionName(e.target.value)}
                            placeholder="My Awesome Collection"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Collection Symbol *
                        </label>
                        <input
                            type="text"
                            value={collectionSymbol}
                            onChange={(e) => setCollectionSymbol(e.target.value.slice(0, 10))}
                            placeholder="MAC"
                            maxLength={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Collection Description
                    </label>
                    <textarea
                        value={metadata.description}
                        onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your collection..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Collection Image URL
                    </label>
                    <input
                        type="url"
                        value={metadata.image}
                        onChange={(e) => setMetadata(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://example.com/collection-image.png"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                    />
                </div>

                <button
                    onClick={handleCreateCollection}
                    disabled={isCreatingMint || !collectionName || !collectionSymbol}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {isCreatingMint ? 'Creating Collection...' : 'Create Collection'}
                </button>

                {mintAddress && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                            <strong>Collection Created:</strong>
                            <br />
                            <code className="break-all">{mintAddress}</code>
                        </p>
                    </div>
                )}
            </div>

            {/* NFT Mint Section */}
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3">Mint NFT</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Collection Address *
                        </label>
                        <input
                            type="text"
                            value={mintAddress}
                            onChange={(e) => setMintAddress(e.target.value)}
                            placeholder="Collection PDA address"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            NFT Name *
                        </label>
                        <input
                            type="text"
                            value={metadata.name}
                            onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="My Awesome NFT"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            NFT Symbol
                        </label>
                        <input
                            type="text"
                            value={metadata.symbol}
                            onChange={(e) => setMetadata(prev => ({ ...prev, symbol: e.target.value }))}
                            placeholder="NFT"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            NFT Image URL
                        </label>
                        <input
                            type="url"
                            value={metadata.image}
                            onChange={(e) => setMetadata(prev => ({ ...prev, image: e.target.value }))}
                            placeholder="https://example.com/nft-image.png"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Recipient Address *
                        </label>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="Recipient wallet address"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                        />
                        <button
                            onClick={() => setRecipient(address || '')}
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                            Use my wallet
                        </button>
                    </div>

                    <button
                        onClick={handleMintNFT}
                        disabled={isMinting || !mintAddress || !recipient || !metadata.name}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {isMinting ? 'Minting NFT...' : 'Mint NFT'}
                    </button>
                </div>
            </div>

            {/* Program Status */}
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3">Program Status</h3>
                <button
                    onClick={async () => {
                        const result = await testProgramExists();
                        alert(`Program Status:\nExists: ${result.exists}\nExecutable: ${result.executable || 'N/A'}\nOwner: ${result.owner || 'N/A'}\nData Length: ${result.dataLength || 0} bytes`);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                    Check Program Status
                </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Friken Sweet NFT Contract:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Anchor-based Solana program for NFT creation and minting</li>
                    <li>• Uses Program Derived Addresses (PDAs) for account management</li>
                    <li>• Supports collection creation and individual NFT minting</li>
                    <li>• Program ID: {FRIKEN_SWEET_PROGRAM_ID}</li>
                </ul>
            </div>

            {/* Add wallet troubleshooting section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">Troubleshooting Tips:</h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• If you get &quot;numRequiredSignatures&quot; error, disconnect and reconnect your wallet</li>
                    <li>• Make sure you&apos;re using a supported Solana wallet (Phantom, Solflare, etc.)</li>
                    <li>• Ensure you have sufficient SOL for transaction fees (at least 0.01 SOL)</li>
                    <li>• Try refreshing the page if wallet connection issues persist</li>
                    <li>• Check that you&apos;re connected to Solana Devnet</li>
                </ul>
            </div>

            {/* Updated status section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-800 mb-2">Direct Transaction Mode:</h4>
                <ul className="text-xs text-green-700 space-y-1">
                    <li>• Transactions are sent directly without simulation</li>
                    <li>• Faster execution but less error prevention</li>
                    <li>• Make sure all parameters are correct before sending</li>
                    <li>• Contract: {FRIKEN_SWEET_PROGRAM_ID}</li>
                </ul>
            </div>
        </div>
    );
}

export default memo(MintComponent);
