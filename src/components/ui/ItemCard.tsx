import { deleteItem } from "@/actions/adminActions";
import { Item } from "@/app/admin/components/ItemsTable";
import Image from "next/image";
import { useState } from "react";

export function ItemCard(props: { item: Item }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [imageError, setImageError] = useState(false);

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

    const removeItem = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item? This will also attempt to remove it from PayPal catalog.")) {
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteItem(id);

            let message = "Item deleted successfully from local database.";

            if (result.paypalDeleted) {
                if (result.paypalMessage?.includes("already deleted") || result.paypalMessage?.includes("never existed")) {
                    message += ` PayPal: ${result.paypalMessage}.`;
                } else {
                    message += " Also removed from PayPal catalog.";
                }
            } else if (result.paypalMessage) {
                message += ` PayPal: ${result.paypalMessage}.`;
            }

            alert(message);

            // Don't force refresh - let parent component handle state updates
            // window.location.reload(); // REMOVED
        } catch (error) {
            console.error("Failed to delete item:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert(`Failed to delete item: ${errorMessage}`);
        } finally {
            setIsDeleting(false);
        }
    }

    const imageUrl = getImageUrl(props.item.img_url);

    return (
        <div className="justify-center items-center content-center" key={props.item.id}>
            <div className="justify-center self-center overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md items-center" key={props.item.id}>
                <div className="relative mx-3 mt-3 flex justify-center items-center p-2 bg-slate-200 overflow-hidden rounded-xl">
                    <Image
                        className="rounded-t-lg"
                        src={imageError ? '/placeholder.png' : imageUrl}
                        alt={props.item.name}
                        width={150}
                        height={150}
                        onError={() => setImageError(true)}
                        unoptimized={imageUrl.startsWith('/uploads/')}
                    />
                </div>
                <div className="items-center justify-center p-2">
                    <h5 className="mb-2 text-xl self-center text-center tracking-tight text-gray-900">{props.item.name}</h5>
                    <p className="mb-3 font-normal text-gray-700">
                        Price: ${props.item.price} | Quantity: {props.item.quantity}
                    </p>
                    <div className="flex justify-center gap-2">
                        <a href="#" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
                            View Details
                            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                            </svg>
                        </a>
                        <button
                            onClick={() => removeItem(props.item.id)}
                            disabled={isDeleting}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                            <svg className="w-3.5 h-3.5 ms-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}