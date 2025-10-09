"use client"

import { Item } from "@/app/admin/components/ItemsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useCartStore from "@/context/cart-context";
import Image from "next/image";

interface ItemCardProps {
    item: Item;
}

export function NItemCard({ item }: ItemCardProps) {
    const { addToCart } = useCartStore();

    const handleAddToCart = () => {
        // Convert Item to PayPalProduct format for cart
        const cartProduct = {
            id: item.id,
            name: item.name,
            description: `${item.name} - Available: ${item.quantity}`,
            image_url: item.img_url,
            price: item.price,
            category: 'DIGITAL_GOODS' as const,
        };

        addToCart(cartProduct);
        console.log("Added to cart:", item.name);
    };

    return (
        <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] duration-300">
            <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                    src={item.img_url || "/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform hover:scale-105 duration-300"
                />
                {item.paypal_status && (
                    <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.paypal_status === 'synced' ? 'bg-green-100 text-green-800' :
                                item.paypal_status === 'local_only' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {item.paypal_status === 'synced' ? 'In Stock' : 'Local Only'}
                        </span>
                    </div>
                )}
            </div>

            <CardHeader className="space-y-2">
                <CardTitle className="font-sans text-xl text-balance">{item.name}</CardTitle>
                <div className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</div>
            </CardHeader>

            <CardContent>
                <CardDescription className="text-sm leading-relaxed text-pretty">
                    Available quantity: {item.quantity}
                    {item.paypal_status === 'synced' && (
                        <span className="block mt-1 text-xs text-green-600">
                            ✓ Synced with PayPal
                        </span>
                    )}
                </CardDescription>
            </CardContent>

            <CardFooter>
                <Button
                    onClick={handleAddToCart}
                    disabled={item.quantity === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {item.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
            </CardFooter>
        </Card>
    )
}
