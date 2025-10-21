import { getAllItems } from "@/actions/actions";
import { Spinner } from "@/components/icons";
import { ItemCard } from "@/components/ui/ItemCard";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";

export type Item = {
    id: string;
    name: string;
    img_url: string;
    price: number;
    quantity: number;
    description?: string | null;
    slug?: string | null;
    is_active?: boolean;
    is_digital?: boolean;
    inventory_tracked?: boolean;
    paypal_product_id?: string | null;
    paypal_sync_status?: string | null;
    paypal_data?: unknown;
    paypal_last_sync?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    paypal_status?: 'synced' | 'missing' | 'local_only' | 'paypal_only';
}

interface ItemsTableProps {
    disableAutoRefresh?: boolean;
}

interface ItemsTableHandle {
    refreshItems: () => Promise<void>;
}

// Add interface for the admin actions module
interface AdminActionsModule {
    syncSingleItemToPayPal?: (
        itemId: string,
        itemName: string,
        itemPrice: number,
        itemQuantity: number,
        imageUrl: string
    ) => Promise<{ success: boolean; data?: { paypal_product_id?: string; paypal_sync_status?: string }; error?: string }>;
    syncItemToPayPal?: (
        itemId: string,
        itemName: string,
        itemPrice: number,
        itemQuantity: number,
        imageUrl: string
    ) => Promise<{ success: boolean; data?: { paypal_product_id?: string; paypal_sync_status?: string }; error?: string }>;
    default?: {
        syncSingleItemToPayPal?: (
            itemId: string,
            itemName: string,
            itemPrice: number,
            itemQuantity: number,
            imageUrl: string
        ) => Promise<{ success: boolean; data?: { paypal_product_id?: string; paypal_sync_status?: string }; error?: string }>;
        syncItemToPayPal?: (
            itemId: string,
            itemName: string,
            itemPrice: number,
            itemQuantity: number,
            imageUrl: string
        ) => Promise<{ success: boolean; data?: { paypal_product_id?: string; paypal_sync_status?: string }; error?: string }>;
    };
}

const ItemsTable = forwardRef<ItemsTableHandle, ItemsTableProps>(
    ({ disableAutoRefresh = false }, ref) => {
        const [items, setItems] = useState<Item[]>([]);
        const [loading, setLoading] = useState(true);
        const [filter, setFilter] = useState<'all' | 'synced' | 'local_only' | 'paypal_only'>('all');
        const [syncingItemId, setSyncingItemId] = useState<string | null>(null);
        const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

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

        const refreshItems = useCallback(async () => {
            // Remove the circular dependency - don't check loading state here
            setLoading(true);
            try {
                console.log('🔄 Refreshing items from database...');
                const fetchedItems = await getAllItems();

                if (!Array.isArray(fetchedItems)) {
                    console.error('getAllItems returned non-array:', fetchedItems);
                    setItems([]);
                    return;
                }

                fetchedItems.forEach((item) => {
                    setImageUrlDev(item);
                });

                setItems(fetchedItems);
                setLastRefresh(new Date());
                console.log('✅ Items refreshed successfully, count:', fetchedItems.length);
            } catch (error) {
                console.error("Failed to refresh items:", error);
                // Set empty array on error instead of keeping old data
                setItems([]);
            } finally {
                setLoading(false);
            }
        }, []); // Removed disableAutoRefresh dependency as it's not used in the function

        // Expose refresh function via ref
        useImperativeHandle(ref, () => ({
            refreshItems
        }), [refreshItems]);

        // Initial load only - use a separate effect
        useEffect(() => {
            let isMounted = true;

            const initialLoad = async () => {
                if (!isMounted) return;

                setLoading(true);
                try {
                    console.log('🔄 Initial load of items...');
                    const fetchedItems = await getAllItems();

                    if (!isMounted) return;

                    if (!Array.isArray(fetchedItems)) {
                        console.error('getAllItems returned non-array:', fetchedItems);
                        setItems([]);
                        return;
                    }

                    fetchedItems.forEach((item) => {
                        setImageUrlDev(item);
                    });

                    setItems(fetchedItems);
                    setLastRefresh(new Date());
                    console.log('✅ Initial items load successful, count:', fetchedItems.length);
                } catch (error) {
                    console.error("Failed to load items initially:", error);
                    if (isMounted) {
                        setItems([]);
                    }
                } finally {
                    if (isMounted) {
                        setLoading(false);
                    }
                }
            };

            initialLoad();

            return () => {
                isMounted = false;
            };
        }, []); // Empty dependency array - only run once

        // Filter logic
        const filteredItems = items.filter(item => {
            if (filter === 'all') return true;
            return item.paypal_status === filter;
        });

        const statusCounts = items.reduce((acc, item) => {
            const status = item.paypal_status || 'unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        if (loading) {
            return (
                <div className="flex justify-center items-center p-8">
                    <div className="text-center">
                        <Spinner size="lg" />
                        <span className="block mt-3 text-lg font-medium">
                            {disableAutoRefresh ? 'Syncing in progress...' : 'Loading items...'}
                        </span>
                    </div>
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

                const adminActions = await import("@/actions/adminActions") as AdminActionsModule;
                const syncSingleItemToPayPal = adminActions.syncSingleItemToPayPal ??
                    adminActions.syncItemToPayPal ??
                    adminActions.default?.syncSingleItemToPayPal ??
                    adminActions.default?.syncItemToPayPal;

                if (!syncSingleItemToPayPal) {
                    throw new Error('syncSingleItemToPayPal not found in "@/actions/adminActions"');
                }

                const result = await syncSingleItemToPayPal(
                    item.id,
                    item.name,
                    item.price,
                    item.quantity,
                    imageUrl
                );

                if (result.success) {
                    alert(`✅ "${item.name}" successfully synced to PayPal!\n\n• PayPal Product ID: ${result.data?.paypal_product_id}\n• Database Status: ${result.data?.paypal_sync_status}\n• Environment: ${isDevelopment ? 'Sandbox' : 'Live'}`);
                    await refreshItems();
                } else {
                    alert(`❌ Failed to sync "${item.name}" to PayPal:\n\n${result.error}`);
                }

            } catch (error) {
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
                                disabled={loading || disableAutoRefresh}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors"
                                title={disableAutoRefresh ? "Refresh disabled during sync" : "Refresh items"}
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-1">
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Refreshing...</span>
                                    </div>
                                ) : (
                                    'Refresh'
                                )}
                            </button>
                            <span className="text-xs text-gray-500">
                                Last updated: {lastRefresh.toLocaleTimeString()}
                            </span>
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

                    <div className="text-sm text-gray-600">
                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>Synced: Items created/synced with PayPal
                        <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2 ml-4"></span>Local Only: Items only in local DB
                        <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2 ml-4"></span>PayPal Only: Items only in PayPal catalog
                    </div>

                    {disableAutoRefresh && (
                        <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            ⚠️ Auto-refresh disabled during sync operations
                        </div>
                    )}
                </div>

                {/* Items Grid */}
                <div className="align-middle self-center place-content-center justify-between items-center content-center flex flex-wrap gap-4">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="relative">
                            <ItemCard item={item} onDelete={refreshItems} />

                            {/* Status Badge with Sync Button */}
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
        );
    }
);

ItemsTable.displayName = 'ItemsTable';

export default ItemsTable;