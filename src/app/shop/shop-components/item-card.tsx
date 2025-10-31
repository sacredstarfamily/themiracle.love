"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useCartStore from "@/context/cart-context";
import { Item } from "@/lib/definitions";
import Image from "next/image";
import { useState } from "react";

interface ItemCardProps {
    item: Item;
}

export function NItemCard({ item }: ItemCardProps) {
    const { addToCart } = useCartStore();
    const [imageError, setImageError] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);

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

    // Check if description has more than 3 sentences
    const description = item.description || 'Discover something amazing with this wonderful product from TheMiracle.Love. Perfect for anyone looking to add a touch of magic to their life. Don\'t miss out on owning this unique item! lorem ipsum dolor sit amet, consectetur adipiscing elit. lorem ipsum dolor sit amet, consectetur adipiscing elit. ';
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const hasLongDescription = sentences.length > 3;
    const shortDescription = hasLongDescription ? sentences.slice(0, 3).join('. ') + '.' : description;

    const imageUrl = getImageUrl(item.img_url);

    return (
        <Card className="overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] duration-300 bg-white border-2 border-pink-200 hover:border-pink-300 rounded-3xl">
            <div className="relative aspect-square overflow-hidden bg-white rounded-t-3xl">
                <Image
                    src={imageError ? '/uploads/images.jpeg' : imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform hover:scale-105 duration-300"
                    onError={() => setImageError(true)}
                    unoptimized={imageUrl.startsWith('/uploads/')}
                />

                {/* Removed overlay for image clarity */}

                {/* Floating status badge */}
                <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        ✨ NEW
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-2 h-2 bg-pink-300 rounded-full animate-bounce"></div>
                <div className="absolute bottom-4 right-16 w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
            </div>

            <CardHeader className="text-center space-y-3 bg-white px-6 py-6">
                <CardTitle className="font-cheri text-2xl text-center text-balance text-gray-800 hover:text-pink-600 transition-colors leading-tight">
                    {item.name}
                </CardTitle>
            </CardHeader>

            <CardContent className="bg-white px-6 pb-6">
                <CardDescription className="text-sm leading-relaxed text-center text-gray-600 hover:text-gray-700 transition-colors">
                    {showFullDescription ? description : shortDescription}
                </CardDescription>

                {/* See More / See Less button */}
                {hasLongDescription && (
                    <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-3 text-xs bg-white text-pink-500 hover:text-pink-600 font-medium transition-colors underline"
                    >
                        {showFullDescription ? 'See Less' : 'See More'}
                    </button>
                )}
            </CardContent>
            <CardContent className="text-center bg-white px-6 pb-6">
                <div className="text-4xl font-sans font-bold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    ${item.price.toFixed(2)}
                </div>
            </CardContent>
            <CardFooter className="bg-white border-t border-pink-100 p-6 rounded-b-3xl">
                <Button
                    onClick={handleAddToCart}
                    disabled={(item.inventory_tracked && item.quantity === 0) || !item.is_active}
                    className="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 hover:from-pink-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-lg py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-300/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none border-2 border-pink-300 hover:border-pink-400 shadow-lg"
                >
                    <span className="flex items-center justify-center space-x-2">
                        {!item.is_active ? (
                            <>
                                <span>💤</span>
                                <span>Unavailable</span>
                            </>
                        ) : (item.inventory_tracked && item.quantity === 0) ? (
                            <>
                                <span>💔</span>
                                <span>Sold Out</span>
                            </>
                        ) : (
                            <>
                                <span>🛒</span>
                                <span>Add to Cart</span>
                                <span>💖</span>
                            </>
                        )}
                    </span>
                </Button>
            </CardFooter>

            {/* Decorative floating elements */}
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-70 animate-bounce pointer-events-none"></div>
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full opacity-70 animate-pulse pointer-events-none"></div>
        </Card>
    )
}
