import { getAllItems } from "@/actions/actions";
import { ItemCard } from "@/components/ui/ItemCard";
import { useEffect, useState } from "react";

export type Item = {
    id: string,
    name: string,
    img_url: string,
    price: number,
    quantity: number,
    paypal_product_id?: string | null,
    paypal_data?: unknown,
    paypal_status?: 'synced' | 'missing' | 'local_only' | 'paypal_only'
}

export default function ItemsTable() {
    const [items, setItems] = useState<Item[]>();
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'synced' | 'local_only' | 'paypal_only'>('all');

    useEffect(() => {
        const isDev = process.env.NODE_ENV === 'development';
        const setImageUrlDev = (item: Item) => {
            if (isDev && item.img_url.startsWith('/public/')) {
                item.img_url = item.img_url.slice(7)
            }
        }
        const fetchItems = async () => {
            setLoading(true);
            try {
                const items = await getAllItems();
                items.forEach((item) => {
                    setImageUrlDev(item);
                })
                setItems(items);
            } catch (error) {
                console.error("Failed to fetch items:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchItems();
    }, [])

    const filteredItems = items?.filter(item => {
        if (filter === 'all') return true;
        return item.paypal_status === filter;
    }) || [];

    const statusCounts = items?.reduce((acc, item) => {
        const status = item.paypal_status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <span className="ml-2">Loading items...</span>
            </div>
        );
    }

    return (
        <div className="p-5">
            {/* Filter and Stats */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Items Inventory</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                            All ({items?.length || 0})
                        </button>
                        <button
                            onClick={() => setFilter('synced')}
                            className={`px-3 py-1 rounded text-sm ${filter === 'synced' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                        >
                            Synced ({statusCounts.synced || 0})
                        </button>
                        <button
                            onClick={() => setFilter('local_only')}
                            className={`px-3 py-1 rounded text-sm ${filter === 'local_only' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                        >
                            Local Only ({statusCounts.local_only || 0})
                        </button>
                        <button
                            onClick={() => setFilter('paypal_only')}
                            className={`px-3 py-1 rounded text-sm ${filter === 'paypal_only' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                        >
                            PayPal Only ({statusCounts.paypal_only || 0})
                        </button>
                    </div>
                </div>

                <div className="text-sm text-gray-600">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>Synced: Items exist in both local DB and PayPal
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2 ml-4"></span>Local Only: Items only in local DB
                    <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2 ml-4"></span>PayPal Only: Items only in PayPal catalog
                </div>
            </div>

            {/* Items Grid */}
            <div className="align-middle self-center place-content-center justify-between items-center content-center flex flex-wrap gap-4">
                {filteredItems.map((item) => (
                    <div key={item.id} className="relative">
                        <ItemCard item={item} />
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.paypal_status === 'synced' ? 'bg-green-100 text-green-800' :
                                item.paypal_status === 'local_only' ? 'bg-yellow-100 text-yellow-800' :
                                    item.paypal_status === 'paypal_only' ? 'bg-purple-100 text-purple-800' :
                                        item.paypal_status === 'missing' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                }`}>
                                {item.paypal_status?.replace('_', ' ') || 'unknown'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No items found for the selected filter.
                </div>
            )}
        </div>
    )
}