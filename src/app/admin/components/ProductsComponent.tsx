import { syncLocalItemsToPayPal, syncPayPalCatalogAction } from "@/actions/adminActions";
import { useState } from "react";
import AddItemForm from "./AddItemForm";
import ItemsTable from "./ItemsTable";

export default function ProductsComponent() {
    const [syncing, setSyncing] = useState(false);
    const [syncingLocal, setSyncingLocal] = useState(false);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const result = await syncPayPalCatalogAction();
            if (result.success) {
                alert(`✅ PayPal Catalog Sync Results:\n\n${result.message}\n\nPage will refresh to show updated items.`);
                // Refresh the page to show updated items
                window.location.reload();
            } else {
                alert(`❌ PayPal Catalog Sync Failed:\n\n${result.error}`);
            }
        } catch (error) {
            alert(`❌ PayPal Catalog Sync Failed:\n\n${error}`);
        } finally {
            setSyncing(false);
        }
    };

    const handleSyncLocal = async () => {
        if (!confirm('This will sync all local-only items to PayPal catalog. Items that already have PayPal product IDs will be skipped. Continue?')) {
            return;
        }

        setSyncingLocal(true);
        try {
            const result = await syncLocalItemsToPayPal();
            if (result.success) {
                const details = result.data?.details ? '\n\nDetails:\n' + result.data.details.join('\n') : '';
                alert(`✅ Local to PayPal Sync Results:\n\n${result.message}${details}\n\nPage will refresh to show updated items.`);
                // Refresh the page to show updated items
                window.location.reload();
            } else {
                alert(`❌ Local to PayPal Sync Failed:\n\n${result.error}`);
            }
        } catch (error) {
            alert(`❌ Local to PayPal Sync Failed:\n\n${error}`);
        } finally {
            setSyncingLocal(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Products Management</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={handleSyncLocal}
                        disabled={syncingLocal || syncing}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Sync all local-only items to PayPal catalog"
                    >
                        {syncingLocal ? 'Syncing Local...' : 'Sync Local → PayPal'}
                    </button>
                    <button
                        onClick={handleSync}
                        disabled={syncing || syncingLocal}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Sync PayPal catalog items to local database"
                    >
                        {syncing ? 'Syncing PayPal...' : 'Sync PayPal → Local'}
                    </button>
                </div>
            </div>

            {/* Status indicator */}
            {(syncing || syncingLocal) && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                        <p className="text-sm font-medium">
                            {syncingLocal ? 'Syncing local items to PayPal catalog...' : 'Syncing PayPal catalog to local database...'}
                        </p>
                    </div>
                    <p className="text-xs mt-1 text-blue-600">
                        Please wait, this may take a few moments. Do not refresh the page.
                    </p>
                </div>
            )}

            <AddItemForm />
            <ItemsTable />
        </div>
    );
}