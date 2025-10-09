import { syncPayPalCatalogAction } from "@/actions/adminActions";
import { useState } from "react";
import AddItemForm from "./AddItemForm";
import ItemsTable from "./ItemsTable";

export default function ProductsComponent() {
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const result = await syncPayPalCatalogAction();
            if (result.success) {
                alert(result.message);
                // Refresh the page to show updated items
                window.location.reload();
            } else {
                alert(`Sync failed: ${result.error}`);
            }
        } catch (error) {
            alert(`Sync failed: ${error}`);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Products Management</h1>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {syncing ? 'Syncing...' : 'Sync PayPal Catalog'}
                </button>
            </div>
            <AddItemForm />
            <ItemsTable />
        </div>
    );
}