'use client';
import { getAllItems } from "@/actions/actions";
import { Item } from "@/app/admin/components/ItemsTable";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ShoppingCart from "../components/ShoppingCart";
import ShoppingCartBtn from "../components/ShoppingCartBtn";
import { NItemCard } from "./shop-components/item-card";
import PayButton from "./shop-components/PayButton";

export default function ShopPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCart, setShowCart] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const fetchedItems = await getAllItems();
                // Filter to show only items that are synced with database and available
                const availableItems = fetchedItems.filter(item =>
                    // Only show items that exist in local database (not PayPal-only)

                    !item.name.includes('| no inventory') &&
                    // Has a valid name and image
                    item.name &&
                    item.img_url
                );
                setItems(availableItems);
            } catch (error) {
                console.error("Failed to fetch items:", error);
                setError("Failed to load shop items");
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const handleCartToggle = () => {
        setShowCart(!showCart);
    };

    const handleCartClose = () => {
        setShowCart(false);
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-lg">Loading shop...</span>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Navbar />
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <ShoppingCartBtn onClick={handleCartToggle} />

            <main className="container mx-auto px-4 py-8 mt-16">

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop</h1>
                    <PayButton />
                    <p className="text-lg text-gray-600">Discover amazing products from TheMiracle</p>
                    <div className="mt-2 text-sm text-gray-500">
                        Showing {items.length} available products from our database
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No items available</h3>
                        <p className="text-gray-500">Check back later for new products!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <NItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </main>

            {showCart && <ShoppingCart onClose={handleCartClose} />}
            <Footer />
        </div>
    );
}