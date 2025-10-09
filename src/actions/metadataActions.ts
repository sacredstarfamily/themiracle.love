"use server";

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
}

export async function uploadMetadataToIPFS(metadata: TokenMetadata) {
    try {
        // In a real implementation, you would upload to IPFS
        // Here's an example using Pinata or similar service

        // const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${process.env.PINATA_JWT}`
        //     },
        //     body: JSON.stringify({
        //         pinataContent: metadata,
        //         pinataMetadata: {
        //             name: `${metadata.name}_metadata`
        //         }
        //     })
        // });

        // const result = await response.json();
        // return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

        // For now, return a mock URI
        const mockHash = Buffer.from(JSON.stringify(metadata)).toString('base64');
        return `https://themiracle.love/api/metadata/${mockHash}`;

    } catch (error) {
        console.error('Error uploading metadata:', error);
        throw new Error('Failed to upload metadata');
    }
}

export async function validateMetadata(metadata: TokenMetadata) {
    const errors: string[] = [];

    if (!metadata.name || metadata.name.length < 1) {
        errors.push('Name is required');
    }

    if (!metadata.symbol || metadata.symbol.length < 1) {
        errors.push('Symbol is required');
    }

    if (!metadata.description || metadata.description.length < 1) {
        errors.push('Description is required');
    }

    if (metadata.image && !isValidUrl(metadata.image)) {
        errors.push('Image must be a valid URL');
    }

    if (metadata.external_url && !isValidUrl(metadata.external_url)) {
        errors.push('External URL must be a valid URL');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

function isValidUrl(string: string): boolean {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
