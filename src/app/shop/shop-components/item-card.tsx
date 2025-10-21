"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useCartStore from "@/context/cart-context";
import { Item } from "@/lib/definitions"; // Updated import
import Image from "next/image";
import { useState } from "react";

interface ItemCardProps {
    item: Item;
}

export function NItemCard({ item }: ItemCardProps) {
    const { addToCart } = useCartStore();
    const [imageError, setImageError] = useState(false);

    // Fix image URL path
    const getImageUrl = (url: string) => {
        if (!url) return '/placeholder.png';

        // Remove /public prefix if it exists
        if (url.startsWith('/public/')) {
            return url.replace('/public', '');
        }

        // If it's already a proper URL (starts with http or /)
        if (url.startsWith('http') || url.startsWith('/')) {
            return url;
        }

        // Add leading slash for relative paths
        return '/' + url;
    };

    const handleAddToCart = () => {
        // Convert Item to PayPalProduct format for cart
        const cartProduct = {
            id: item.id,
            name: item.name,
            description: item.description || `${item.name} - Available: ${item.quantity}`,
            image_url: item.img_url,
            price: item.price,
            category: (item.is_digital ? 'DIGITAL_GOODS' : 'PHYSICAL_GOODS') as 'DIGITAL_GOODS' | 'PHYSICAL_GOODS',
        };

        addToCart(cartProduct);
        console.log("Added new item instance to cart:", item.name, "Price:", item.price);
    };

    const imageUrl = getImageUrl(item.img_url);

    return (
        <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] duration-300">
            <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                    src={imageError ? '/placeholder.png' : imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform hover:scale-105 duration-300"
                    onError={() => setImageError(true)}
                    unoptimized={imageUrl.startsWith('/uploads/')}
                />

                {/* Item status indicators */}
                <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    {item.is_digital && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Digital</span>
                    )}
                    {!item.is_active && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Inactive</span>
                    )}
                </div>
            </div>

            <CardHeader className="space-y-2">
                <CardTitle className="font-sans text-xl text-balance">{item.name}</CardTitle>
                <div className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</div>
            </CardHeader>

            <CardContent>
                <CardDescription className="text-sm leading-relaxed text-pretty">
                    {item.description || 'No description available.'}
                </CardDescription>

                {/* Additional item details */}
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                    {item.slug && <p>Product Code: {item.slug}</p>}
                    <p>Available: {item.inventory_tracked ? `${item.quantity} units` : 'Unlimited'}</p>
                    {item.createdAt && (
                        <p>Added: {new Date(item.createdAt).toLocaleDateString()}</p>
                    )}
                </div>
            </CardContent>

            <CardFooter>
                <Button
                    onClick={handleAddToCart}
                    disabled={(item.inventory_tracked && item.quantity === 0) || !item.is_active}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {!item.is_active ? 'Unavailable' :
                        (item.inventory_tracked && item.quantity === 0) ? 'Out of Stock' :
                            'Add to Cart'}
                </Button>
            </CardFooter>
        </Card>
    )
}
