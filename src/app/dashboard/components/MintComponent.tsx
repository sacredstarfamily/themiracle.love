'use client';
import type { Provider } from "@reown/appkit-adapter-solana";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import {
    createAssociatedTokenAccountInstruction,
    createInitializeMintInstruction,
    createMintToInstruction,
    getAssociatedTokenAddress,
    getMinimumBalanceForRentExemptMint,
    MINT_SIZE,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction
} from "@solana/web3.js";
import { memo, useCallback, useState } from "react";

const CONTRACT_ADDRESS = "3YNNGxXYc8SJsUAizUWcFnTZowJ1krZjtk6jtFWsxJjn";

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
    token_name?: string; // Add token_name field
}

function MintComponent() {
    const { address } = useAppKitAccount();
    const { connection } = useAppKitConnection();
    const { walletProvider } = useAppKitProvider<Provider>('solana');

    const [isMinting, setIsMinting] = useState(false);
    const [isCreatingMint, setIsCreatingMint] = useState(false);
    const [isUploadingMetadata, setIsUploadingMetadata] = useState(false);
    const [mintAddress, setMintAddress] = useState<string>('');
    const [mintAmount, setMintAmount] = useState<number>(1);
    const [recipient, setRecipient] = useState<string>('');
    const [metadataUri, setMetadataUri] = useState<string>('');

    // Metadata form fields
    const [metadata, setMetadata] = useState<TokenMetadata>({
        name: '',
        symbol: '',
        description: '',
        image: '',
        attributes: [],
        external_url: '',
        animation_url: '',
        token_name: '' // Initialize token_name
    });
    const [newAttribute, setNewAttribute] = useState({ trait_type: '', value: '' });

    const uploadMetadata = useCallback(async () => {
        if (!metadata.name || !metadata.symbol || !metadata.description) {
            throw new Error('Name, symbol, and description are required');
        }

        setIsUploadingMetadata(true);
        try {
            // Upload to IPFS or your preferred storage
            // For now, we'll create a data URL or use a mock service
            const metadataJson = {
                ...metadata,
                attributes: metadata.attributes.filter(attr => attr.trait_type && attr.value)
            };

            // In a real implementation, you'd upload to IPFS
            // const response = await fetch('/api/upload-metadata', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(metadataJson)
            // });

            // For demo purposes, create a mock URI
            const mockUri = `https://themiracle.love/metadata/${Date.now()}.json`;
            setMetadataUri(mockUri);

            console.log('Metadata prepared:', metadataJson);
            return mockUri;
        } catch (error) {
            console.error('Error uploading metadata:', error);
            throw error;
        } finally {
            setIsUploadingMetadata(false);
        }
    }, [metadata]);

    const addAttribute = () => {
        if (newAttribute.trait_type && newAttribute.value) {
            setMetadata(prev => ({
                ...prev,
                attributes: [...prev.attributes, newAttribute]
            }));
            setNewAttribute({ trait_type: '', value: '' });
        }
    };

    const removeAttribute = (index: number) => {
        setMetadata(prev => ({
            ...prev,
            attributes: prev.attributes.filter((_, i) => i !== index)
        }));
    };

    const createMint = useCallback(async () => {
        if (!walletProvider || !address || !connection) {
            throw new Error('Wallet not connected');
        }

        setIsCreatingMint(true);
        try {
            // Generate a NEW keypair for the mint (not using hardcoded address)
            const mintKeypair = Keypair.generate();
            console.log('Generated mint keypair:', mintKeypair.publicKey.toString());

            // Get rent exemption amount
            const rentExemption = await getMinimumBalanceForRentExemptMint(connection);
            console.log('Rent exemption:', rentExemption);

            // Create transaction
            const transaction = new Transaction();

            // Add create account instruction
            transaction.add(
                SystemProgram.createAccount({
                    fromPubkey: walletProvider.publicKey!,
                    newAccountPubkey: mintKeypair.publicKey,
                    space: MINT_SIZE,
                    lamports: rentExemption,
                    programId: TOKEN_PROGRAM_ID,
                })
            );

            // Add initialize mint instruction
            transaction.add(
                createInitializeMintInstruction(
                    mintKeypair.publicKey,
                    0, // decimals
                    walletProvider.publicKey!, // mint authority
                    walletProvider.publicKey!  // freeze authority
                )
            );

            // Get recent blockhash
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = walletProvider.publicKey;

            console.log('Transaction before signing:', transaction);

            // Partially sign with mint keypair
            transaction.partialSign(mintKeypair);

            console.log('Transaction after partial signing:', transaction);

            // Sign and send transaction
            const signature = await walletProvider.signAndSendTransaction(transaction);
            console.log('Transaction signature:', signature);

            // Wait for confirmation
            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            }, 'confirmed');

            if (confirmation.value.err) {
                throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
            }

            console.log('Mint created successfully with signature:', signature);
            setMintAddress(mintKeypair.publicKey.toString());

            return mintKeypair.publicKey.toString();
        } catch (error) {
            console.error('Error creating mint:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to create mint: ${error.message}`);
            }
            throw new Error('Unknown error occurred while creating mint');
        } finally {
            setIsCreatingMint(false);
        }
    }, [walletProvider, address, connection]);

    const mintTo = useCallback(async () => {
        if (!walletProvider || !address || !connection || !mintAddress || !recipient) {
            throw new Error('Missing required parameters');
        }

        setIsMinting(true);
        try {
            const mintPubkey = new PublicKey(mintAddress);
            const recipientPubkey = new PublicKey(recipient);

            console.log('Minting to:', {
                mint: mintPubkey.toString(),
                recipient: recipientPubkey.toString(),
                amount: mintAmount
            });

            // Get associated token account for recipient
            const associatedTokenAccount = await getAssociatedTokenAddress(
                mintPubkey,
                recipientPubkey
            );

            console.log('Associated token account:', associatedTokenAccount.toString());

            // Check if associated token account exists
            const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
            console.log('Account info:', accountInfo);

            const transaction = new Transaction();

            // Create associated token account if it doesn't exist
            if (!accountInfo) {
                console.log('Creating associated token account...');
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                        walletProvider.publicKey!, // payer
                        associatedTokenAccount,   // associated token account
                        recipientPubkey,         // owner
                        mintPubkey               // mint
                    )
                );
            }

            // Add mint to instruction
            transaction.add(
                createMintToInstruction(
                    mintPubkey,              // mint
                    associatedTokenAccount,  // destination
                    walletProvider.publicKey!, // authority
                    mintAmount               // amount
                )
            );

            // Get recent blockhash
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = walletProvider.publicKey;

            console.log('Mint transaction:', transaction);

            // Sign and send transaction
            const signature = await walletProvider.signAndSendTransaction(transaction);
            console.log('Mint transaction signature:', signature);

            // Wait for confirmation
            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            }, 'confirmed');

            if (confirmation.value.err) {
                throw new Error(`Mint transaction failed: ${JSON.stringify(confirmation.value.err)}`);
            }

            console.log('Tokens minted successfully with signature:', signature);

            return signature;
        } catch (error) {
            console.error('Error minting tokens:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to mint tokens: ${error.message}`);
            }
            throw new Error('Unknown error occurred while minting tokens');
        } finally {
            setIsMinting(false);
        }
    }, [walletProvider, address, connection, mintAddress, recipient, mintAmount]);

    const handleCreateMint = async () => {
        try {
            const newMintAddress = await createMint();
            alert(`Mint created successfully!\nMint Address: ${newMintAddress}`);
        } catch (error) {
            console.error('Create mint error:', error);
            alert('Failed to create mint: ' + (error as Error).message);
        }
    };

    const handleMintTo = async () => {
        try {
            const signature = await mintTo();
            alert(`Tokens minted successfully!\nTransaction: ${signature}`);
        } catch (error) {
            console.error('Mint to error:', error);
            alert('Failed to mint tokens: ' + (error as Error).message);
        }
    };

    const handleUploadMetadata = async () => {
        try {
            await uploadMetadata();
            alert('Metadata uploaded successfully!');
        } catch (error) {
            alert('Failed to upload metadata: ' + (error as Error).message);
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
            <h2 className="text-2xl font-bold text-gray-800">Solana NFT Minting</h2>
            <p className="text-sm text-gray-600">Reference Contract: {CONTRACT_ADDRESS}</p>

            {/* Metadata Section */}
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3">Token Metadata</h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Token Name *
                        </label>
                        <input
                            type="text"
                            value={metadata.token_name}
                            onChange={(e) => setMetadata(prev => ({ ...prev, token_name: e.target.value }))}
                            placeholder="e.g., The Miracle Token"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Display Name *
                        </label>
                        <input
                            type="text"
                            value={metadata.name}
                            onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., My Awesome NFT"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Symbol *
                        </label>
                        <input
                            type="text"
                            value={metadata.symbol}
                            onChange={(e) => setMetadata(prev => ({ ...prev, symbol: e.target.value }))}
                            placeholder="e.g., MYNFT"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            External URL
                        </label>
                        <input
                            type="url"
                            value={metadata.external_url}
                            onChange={(e) => setMetadata(prev => ({ ...prev, external_url: e.target.value }))}
                            placeholder="https://yourwebsite.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                    </label>
                    <textarea
                        value={metadata.description}
                        onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your NFT..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal resize-vertical"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                    </label>
                    <input
                        type="url"
                        value={metadata.image}
                        onChange={(e) => setMetadata(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://example.com/image.png"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
                    />
                </div>

                {/* Attributes Section */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attributes
                    </label>

                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newAttribute.trait_type}
                            onChange={(e) => setNewAttribute(prev => ({ ...prev, trait_type: e.target.value }))}
                            placeholder="Trait Type (e.g., Color)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
                        />
                        <input
                            type="text"
                            value={newAttribute.value}
                            onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                            placeholder="Value (e.g., Blue)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
                        />
                        <button
                            onClick={addAttribute}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150"
                        >
                            Add
                        </button>
                    </div>

                    {metadata.attributes.length > 0 && (
                        <div className="space-y-2">
                            {metadata.attributes.map((attr, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <span className="text-sm">
                                        <strong>{attr.trait_type}:</strong> {attr.value}
                                    </span>
                                    <button
                                        onClick={() => removeAttribute(index)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleUploadMetadata}
                    disabled={isUploadingMetadata || !metadata.name || !metadata.symbol || !metadata.description || !metadata.token_name}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                    {isUploadingMetadata ? 'Uploading Metadata...' : 'Prepare Metadata'}
                </button>

                {metadataUri && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm text-purple-700">
                            <strong>Metadata URI:</strong>
                            <br />
                            <code className="break-all">{metadataUri}</code>
                        </p>
                    </div>
                )}
            </div>

            {/* Create Mint Section */}
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-3">Create New Mint</h3>
                <p className="text-sm text-gray-500 mb-3">
                    This will create a new SPL token mint with you as the authority
                </p>

                {/* Debug info */}
                <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                    <p><strong>Connected:</strong> {address ? 'Yes' : 'No'}</p>
                    <p><strong>Wallet:</strong> {address || 'Not connected'}</p>
                    <p><strong>Network:</strong> {connection ? 'Connected' : 'Not connected'}</p>
                </div>

                <button
                    onClick={handleCreateMint}
                    disabled={isCreatingMint || !address || !connection}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                    {isCreatingMint ? 'Creating Mint...' : 'Create New Mint'}
                </button>

                {mintAddress && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                            <strong>New Mint Address:</strong>
                            <br />
                            <code className="break-all">{mintAddress}</code>
                        </p>
                        <button
                            onClick={() => navigator.clipboard.writeText(mintAddress)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                            Copy to clipboard
                        </button>
                    </div>
                )}
            </div>

            {/* Mint To Section */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Mint Tokens</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mint Address
                        </label>
                        <input
                            type="text"
                            value={mintAddress}
                            onChange={(e) => setMintAddress(e.target.value)}
                            placeholder="Enter mint address or create new mint above"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Recipient Address
                        </label>
                        <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="Enter recipient wallet address"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
                        />
                        <button
                            onClick={() => setRecipient(address || '')}
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                            Use my wallet address
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount
                        </label>
                        <input
                            type="number"
                            value={mintAmount}
                            onChange={(e) => setMintAmount(Number(e.target.value))}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
                        />
                    </div>

                    {metadataUri && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Metadata URI
                            </label>
                            <input
                                type="text"
                                value={metadataUri}
                                onChange={(e) => setMetadataUri(e.target.value)}
                                placeholder="Enter metadata URI"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
                            />
                        </div>
                    )}

                    <button
                        onClick={handleMintTo}
                        disabled={isMinting || !mintAddress || !recipient}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                        {isMinting ? 'Minting...' : 'Mint Tokens'}
                    </button>
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">How it works:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>1. Fill in token name and metadata to define your token&#39;s properties and attributes</li>
                    <li>2. Create a new mint generates a new SPL token with you as authority</li>
                    <li>3. Mint tokens creates tokens and sends them to the specified address</li>
                    <li>4. Metadata follows NFT standards and can include images, descriptions, and traits</li>
                </ul>
            </div>
        </div>
    );
}

export default memo(MintComponent);
