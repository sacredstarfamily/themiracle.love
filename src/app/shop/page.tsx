'use client';
import { getAllItems } from "@/actions/actions";
import { Spinner } from "@/components/icons";
import { Item } from "@/lib/definitions"; // Updated import
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
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                console.log('🔄 Fetching items for shop page...');
                const fetchedItems = await getAllItems();

                if (!Array.isArray(fetchedItems)) {
                    console.error('getAllItems returned non-array:', fetchedItems);
                    setItems([]);
                    setError("Invalid data format received");
                    return;
                }

                console.log(`📊 Received ${fetchedItems.length} items from getAllItems`);

                // Enhanced filtering to use all available fields
                const availableItems = fetchedItems.filter(item => {
                    // Only show items that exist in local database (not PayPal-only)
                    const isNotPayPalOnly = !item.id?.startsWith('paypal_');
                    // Don't show items marked as no inventory
                    const hasInventory = !item.name?.includes('| no inventory');
                    // Has valid name and image
                    const hasValidData = item.name && item.img_url;
                    // Has quantity > 0 or is not tracking inventory
                    const hasStock = item.quantity > 0 || !item.inventory_tracked;
                    // Item is active
                    const isActive = item.is_active !== false;

                    return isNotPayPalOnly && hasInventory && hasValidData && hasStock && isActive;
                });

                console.log(`📊 Filtered to ${availableItems.length} available items for shop`);
                setItems(availableItems);
            } catch (error) {
                console.error("Failed to fetch items:", error);
                setError("Failed to load shop items");
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const handleCartToggle = () => {
        console.log('Cart toggle clicked, current state:', isCartOpen);
        setIsCartOpen(!isCartOpen);
    };

    const handleCartClose = () => {
        console.log('Cart close clicked');
        setIsCartOpen(false);
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center">
                        <Spinner size="xl" />
                        <span className="block mt-4 text-lg font-medium text-gray-700">Loading shop...</span>
                    </div>
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

            {/* Sticky positioning for cart button - top right */}
            <div className="sticky top-16 right-0 z-40 flex justify-end pr-6 pt-2">
                <ShoppingCartBtn onClick={handleCartToggle} />
            </div>

            {/* Main content with top padding for sticky navbar */}
            <main className="container mx-auto px-4 py-8 pt-6 min-h-screen">

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop</h1>

                    <p className="text-lg text-gray-600">Discover amazing products from TheMiracle.Love</p>

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
            <PayButton />
            <ShoppingCart isOpen={isCartOpen} onClose={handleCartClose} />
            <Footer />
        </div>
    );
}