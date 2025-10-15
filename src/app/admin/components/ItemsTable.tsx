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
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'synced' | 'local_only' | 'paypal_only'>('all');
    const [syncingItemId, setSyncingItemId] = useState<string | null>(null);

    // Move setImageUrlDev to top-level so it's accessible in both refreshItems and useEffect
    const setImageUrlDev = (item: Item) => {
        // Fix image URL paths - remove /public prefix if it exists
        if (item.img_url.startsWith('/public/')) {
            item.img_url = item.img_url.replace('/public', '');
        }
        // Ensure the path starts with / for Next.js static serving
        if (!item.img_url.startsWith('/') && !item.img_url.startsWith('http')) {
            item.img_url = '/' + item.img_url;
        }
    };

    const refreshItems = async () => {
        console.log("ItemsTable: Refreshing items list...");
        setLoading(true);
        try {
            const items = await getAllItems();
            console.log("ItemsTable: Refreshed items:", items.length);

            // Debug: Log items by status after refresh
            const statusDebug = items.reduce((acc, item) => {
                const status = item.paypal_status || 'unknown';
                if (!acc[status]) acc[status] = [];
                acc[status].push(item.name);
                return acc;
            }, {} as Record<string, string[]>);

            console.log("ItemsTable: Items by status after refresh:", statusDebug);

            items.forEach((item) => {
                setImageUrlDev(item);
            });
            setItems(items);
        } catch (error) {
            console.error("ItemsTable: Failed to refresh items:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                console.log("ItemsTable: Fetching items...");
                const items = await getAllItems();

                console.log("ItemsTable: Received items:", items.length);
                console.log("ItemsTable: Sample item statuses:", items.slice(0, 3).map(i => ({ name: i.name, status: i.paypal_status })));

                items.forEach((item) => {
                    setImageUrlDev(item);
                })
                setItems(items);
            } catch (error) {
                console.error("ItemsTable: Failed to fetch items:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchItems();
    }, [])

    // Enhanced filter logic with better debugging
    const filteredItems = items.filter(item => {
        if (filter === 'all') return true;

        const itemStatus = item.paypal_status;
        const matches = itemStatus === filter;

        // Debug logging for specific filters
        if (filter === 'synced' && itemStatus === 'synced') {
            console.log(`✅ Including synced item: ${item.name} (PayPal ID: ${item.paypal_product_id})`);
        }

        if (filter === 'local_only' && itemStatus === 'local_only') {
            console.log(`📍 Including local-only item: ${item.name}`);
        }

        return matches;
    });

    console.log("ItemsTable: Filter results:", {
        filter,
        totalItems: items.length,
        filteredItems: filteredItems.length,
        expectedForFilter: items.filter(i => i.paypal_status === filter).length,
        statusBreakdown: items.reduce((acc, item) => {
            const status = item.paypal_status || 'unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    });

    const statusCounts = items.reduce((acc, item) => {
        const status = item.paypal_status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log("ItemsTable: Status counts:", statusCounts);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <span className="ml-2">Loading items...</span>
            </div>
        );
    }

    const syncSingleItemToPayPal = async (item: Item) => {
        if (!confirm(`Sync "${item.name}" to PayPal catalog?`)) {
            return;
        }

        setSyncingItemId(item.id);
        try {
            const isDevelopment = process.env.NODE_ENV === 'development';

            // Prepare the image URL for PayPal
            let imageUrl: string;
            if (isDevelopment) {
                imageUrl = "https://via.placeholder.com/400x400.png?text=Product+Image";
            } else {
                let cleanImageUrl = item.img_url;
                if (cleanImageUrl.startsWith('/public/')) {
                    cleanImageUrl = cleanImageUrl.replace('/public', '');
                }
                imageUrl = `https://themiracle.love${cleanImageUrl}`;
            }

            console.log(`Client: Requesting sync for ${item.name}`);

            // Call the server action instead of using Prisma directly
            const { syncSingleItemToPayPal } = await import("@/actions/adminActions");
            
            const result = await syncSingleItemToPayPal(
                item.id,
                item.name,
                item.price,
                item.quantity,
                imageUrl
            );

            if (result.success) {
                console.log(`✅ Sync successful:`, result.data);
                
                alert(`✅ "${item.name}" successfully synced to PayPal!\n\n• PayPal Product ID: ${result.data?.paypal_product_id}\n• Database Status: ${result.data?.paypal_sync_status}\n• Environment: ${isDevelopment ? 'Sandbox' : 'Live'}`);

                // Refresh items list to show updated status
                await refreshItems();
            } else {
                console.error(`❌ Sync failed:`, result.error);
                alert(`❌ Failed to sync "${item.name}" to PayPal:\n\n${result.error}`);
            }

        } catch (error) {
            console.error(`❌ Unexpected error syncing ${item.name}:`, error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            alert(`❌ Failed to sync "${item.name}" to PayPal:\n\n${errorMsg}`);
        } finally {
            setSyncingItemId(null);
        }
    };

    return (
        <div className="p-5">
            {/* Enhanced Filter and Stats */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold">Items Inventory</h2>
                        <button
                            onClick={refreshItems}
                            disabled={loading}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            All ({items.length})
                        </button>
                        <button
                            onClick={() => setFilter('synced')}
                            className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'synced' ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            Synced ({statusCounts.synced || 0})
                        </button>
                        <button
                            onClick={() => setFilter('local_only')}
                            className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'local_only' ? 'bg-yellow-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            Local Only ({statusCounts.local_only || 0})
                        </button>
                        <button
                            onClick={() => setFilter('paypal_only')}
                            className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'paypal_only' ? 'bg-purple-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                            PayPal Only ({statusCounts.paypal_only || 0})
                        </button>
                    </div>
                </div>

                {/* Enhanced Debug Info */}
                <div className="text-xs text-gray-500 mb-2 space-y-1">
                    <div>Filter: &quot;{filter}&quot; | Showing: {filteredItems.length}/{items.length} items</div>
                    <div>Status counts: Synced({statusCounts.synced || 0}) | Local({statusCounts.local_only || 0}) | PayPal({statusCounts.paypal_only || 0}) | Missing({statusCounts.missing || 0})</div>
                    {filteredItems.length > 0 && (
                        <div>Sample filtered items: {filteredItems.slice(0, 3).map(i => `${i.name}[${i.paypal_status}]`).join(', ')}</div>
                    )}
                </div>

                <div className="text-sm text-gray-600">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>Synced: Items created/synced with PayPal
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2 ml-4"></span>Local Only: Items only in local DB
                    <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2 ml-4"></span>PayPal Only: Items only in PayPal catalog
                </div>
            </div>

            {/* Items Grid */}
            <div className="align-middle self-center place-content-center justify-between items-center content-center flex flex-wrap gap-4">
                {filteredItems.map((item) => (
                    <div key={item.id} className="relative">
                        <ItemCard item={item} onDelete={refreshItems} />

                        {/* Enhanced Status Badge with Sync Button */}
                        <div className="absolute top-2 right-2 z-10 flex flex-col space-y-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.paypal_status === 'synced' ? 'bg-green-100 text-green-800' :
                                item.paypal_status === 'local_only' ? 'bg-yellow-100 text-yellow-800' :
                                    item.paypal_status === 'paypal_only' ? 'bg-purple-100 text-purple-800' :
                                        item.paypal_status === 'missing' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                }`}>
                                {item.paypal_status?.replace('_', ' ') || 'unknown'}
                            </span>

                            {/* Sync button for local-only items */}
                            {item.paypal_status === 'local_only' && (
                                <button
                                    onClick={() => syncSingleItemToPayPal(item)}
                                    disabled={syncingItemId === item.id}
                                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {syncingItemId === item.id ? '...' : '+ PayPal'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && items.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>No items found for filter: <strong>{filter}</strong></p>
                    <p className="text-sm mt-2">Try selecting a different filter above.</p>
                </div>
            )}

            {items.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                    <p>No items found in the database.</p>
                    <p className="text-sm mt-2">Add some items to get started!</p>
                </div>
            )}
        </div>
    )
}