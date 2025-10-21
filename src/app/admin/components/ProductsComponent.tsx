import { syncPayPalCatalogAction } from "@/actions/adminActions";
import PaypalItemsComponent from "@/app/shop/shop-components/PaypalItemsComponent";
import { useCallback, useRef, useState } from "react";
import AddItemForm from "./AddItemForm";
import ItemsTable from "./ItemsTable";

export default function ProductsComponent() {
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<string | null>(null);
    const [showSyncResult, setShowSyncResult] = useState(false);

    // Use refs to track component state and prevent unnecessary re-renders
    const itemsTableRef = useRef<{ refreshItems: () => Promise<void> } | null>(null);
    const paypalComponentRef = useRef<{ refreshItems: () => Promise<void> } | null>(null);

    const handleSync = useCallback(async () => {
        setSyncing(true);
        setSyncResult(null);
        setShowSyncResult(false);

        try {
            console.log('🔄 Starting PayPal → Local sync...');
            const result = await syncPayPalCatalogAction();

            if (result.success) {
                const message = `✅ PayPal Catalog Sync Results:\n\n${result.message}`;
                setSyncResult(message);
                console.log('✅ Sync completed successfully');

                // Refresh items table without page reload
                if (itemsTableRef.current?.refreshItems) {
                    console.log('🔄 Refreshing items table...');
                    await itemsTableRef.current.refreshItems();
                }
            } else {
                const errorMessage = `❌ PayPal Catalog Sync Failed:\n\n${result.error}`;
                setSyncResult(errorMessage);
                console.error('❌ Sync failed:', result.error);
            }
        } catch (error) {
            const errorMessage = `❌ PayPal Catalog Sync Failed:\n\n${error}`;
            setSyncResult(errorMessage);
            console.error('❌ Sync error:', error);
        } finally {
            setSyncing(false);
            setShowSyncResult(true);

            // Auto-hide result after 5 seconds
            setTimeout(() => {
                setShowSyncResult(false);
            }, 5000);
        }
    }, []);

    const handleSyncLocal = useCallback(() => {
        const message = `💡 Local to PayPal Sync:

This feature is being developed. In the meantime:

• New items created below will automatically sync to PayPal
• Use "PayPal Catalog Management" section to create items directly in PayPal  
• Use "Sync PayPal → Local" to import PayPal items to local database`;

        alert(message);
    }, []);

    // Callback for when items are successfully added
    const handleItemAdded = useCallback(async () => {
        console.log('🔄 Item added, refreshing components...');

        // Refresh both components without page reload
        if (itemsTableRef.current?.refreshItems) {
            await itemsTableRef.current.refreshItems();
        }

        if (paypalComponentRef.current?.refreshItems) {
            await paypalComponentRef.current.refreshItems();
        }
    }, []);

    // Callback for when PayPal items are created/updated
    const handlePayPalItemsChanged = useCallback(async () => {
        console.log('🔄 PayPal items changed, refreshing items table...');

        if (itemsTableRef.current?.refreshItems) {
            await itemsTableRef.current.refreshItems();
        }
    }, []);

    return (
        <div className="space-y-6">
            {/* Header with Action Buttons */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Products Management</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={handleSyncLocal}
                        disabled={syncing}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Sync all local-only items to PayPal catalog (coming soon)"
                    >
                        Sync Local → PayPal
                    </button>
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Sync PayPal catalog items to local database"
                    >
                        {syncing ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Syncing...</span>
                            </div>
                        ) : (
                            'Sync PayPal → Local'
                        )}
                    </button>
                </div>
            </div>

            {/* Enhanced Status Indicators */}
            {syncing && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                        <div>
                            <p className="text-sm font-medium">
                                Syncing PayPal catalog to local database...
                            </p>
                            <p className="text-xs mt-1">
                                Please wait, this may take a few moments. The page will update automatically when complete.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Sync Result Display */}
            {showSyncResult && syncResult && (
                <div className={`px-4 py-3 rounded-lg border ${syncResult.includes('✅')
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <pre className="text-sm whitespace-pre-wrap font-medium">
                                {syncResult}
                            </pre>
                        </div>
                        <button
                            onClick={() => setShowSyncResult(false)}
                            className="ml-4 text-gray-400 hover:text-gray-600"
                            aria-label="Dismiss"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Add Item Form with Callback */}
            <AddItemForm onItemAdded={handleItemAdded} />

            {/* PayPal Items Management Section */}
            <div className="bg-white rounded-lg shadow border">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">PayPal Catalog Management</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Create and manage items directly in your PayPal catalog
                    </p>
                </div>
                <div className="p-6">
                    <PaypalItemsComponent
                        ref={paypalComponentRef}
                        onItemsChanged={handlePayPalItemsChanged}
                    />
                </div>
            </div>

            {/* Items Table with Ref for Manual Refresh */}
            <ItemsTable
                ref={itemsTableRef}
                disableAutoRefresh={syncing}
            />
        </div>
    );
}