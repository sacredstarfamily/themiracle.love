"use client";

import { addItem } from "@/actions/adminActions";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

const INITIAL_STATE = {
    data: "", // Changed from null to empty string to match expected type
};

function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
    const { pending } = useFormStatus();
    const isLoading = pending || isSubmitting;

    return (
        <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                } text-white disabled:opacity-75`}
        >
            {isLoading ? (
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating & Syncing...</span>
                </div>
            ) : (
                'Create Item'
            )}
        </button>
    );
}

interface AddItemFormProps {
    onItemAdded?: () => Promise<void> | void;
}

export default function AddItemForm({ onItemAdded }: AddItemFormProps = {}) {
    const [formState, formAction] = useActionState(addItem, INITIAL_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSubmissionResult, setLastSubmissionResult] = useState<string>("");

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        setLastSubmissionResult("");

        try {
            console.log('🔄 Starting form submission...');
            formAction(formData);
        } finally {
            // Track the result and call callback
            setTimeout(async () => {
                setIsSubmitting(false);

                // Check if submission was successful
                const isSuccess = formState?.data && (
                    formState.data.includes('✅') ||
                    formState.data.includes('created successfully')
                );

                if (isSuccess && onItemAdded) {
                    console.log('🔄 Item creation successful, calling callback...');
                    try {
                        await onItemAdded();
                    } catch (error) {
                        console.error('Error in onItemAdded callback:', error);
                    }
                }

                setLastSubmissionResult(formState?.data || "");
            }, 1000);
        }
    };

    // Use the last submission result if formState.data is empty
    const displayMessage = formState?.data || lastSubmissionResult;

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Item</h2>

            {/* Enhanced status display */}
            {displayMessage && (
                <div className={`mb-4 p-4 rounded-lg border ${displayMessage.includes('✅') && displayMessage.includes('SYNCED')
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : displayMessage.includes('⚠️')
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                        : displayMessage.includes('❌')
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}>
                    <div className="flex justify-between items-start">
                        <div className="flex-1 whitespace-pre-line text-sm font-medium">
                            {displayMessage}
                        </div>
                        <button
                            onClick={() => {
                                setLastSubmissionResult("");
                                if (formState) formState.data = "";
                            }}
                            className="ml-4 text-gray-400 hover:text-gray-600"
                            aria-label="Dismiss"
                        >
                            ×
                        </button>
                    </div>
                    {displayMessage.includes('LOCAL_ONLY') && (
                        <div className="mt-2 text-xs">
                            <p>💡 <strong>Tip:</strong> You can sync this item to PayPal later using the &quot;Sync PayPal → Local&quot; button above.</p>
                        </div>
                    )}
                </div>
            )}

            <form action={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="item_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Item Name *
                        </label>
                        <input
                            type="text"
                            id="item_name"
                            name="item_name"
                            required
                            maxLength={127}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter item name"
                        />
                        <p className="text-xs text-gray-500 mt-1">Maximum 127 characters</p>
                    </div>

                    <div>
                        <label htmlFor="item_price" className="block text-sm font-medium text-gray-700 mb-1">
                            Price (USD) *
                        </label>
                        <input
                            type="number"
                            id="item_price"
                            name="item_price"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="item_quantity" className="block text-sm font-medium text-gray-700 mb-1">
                            Inventory Quantity *
                        </label>
                        <input
                            type="number"
                            id="item_quantity"
                            name="item_quantity"
                            required
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Available inventory count</p>
                    </div>

                    <div>
                        <label htmlFor="item_image" className="block text-sm font-medium text-gray-700 mb-1">
                            Product Image *
                        </label>
                        <input
                            type="file"
                            id="item_image"
                            name="item_image"
                            accept="image/*"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Recommended: 400x400px minimum</p>
                    </div>
                </div>

                {/* PayPal Product Configuration */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">PayPal Product Configuration</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="paypal_type" className="block text-sm font-medium text-gray-700 mb-1">
                                Product Type *
                            </label>
                            <select
                                id="paypal_type"
                                name="paypal_type"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="SERVICE">SERVICE - Services (recommended)</option>
                                <option value="DIGITAL">DIGITAL - Digital goods</option>
                                <option value="PHYSICAL">PHYSICAL - Physical goods</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Cannot be changed after PayPal creation</p>
                        </div>

                        <div>
                            <label htmlFor="paypal_category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                id="paypal_category"
                                name="paypal_category"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="SOFTWARE">SOFTWARE - Software products</option>
                                <option value="DIGITAL_MEDIA_BOOKS_MOVIES_MUSIC">DIGITAL_MEDIA - Digital downloads</option>
                                <option value="ART_AND_CRAFTS">ART_AND_CRAFTS - Art and creative works</option>
                                <option value="ENTERTAINMENT">ENTERTAINMENT - Entertainment content</option>
                                <option value="MUSIC">MUSIC - Music and audio</option>
                                <option value="GAMES">GAMES - Video games</option>
                                <option value="EDUCATION_AND_TEXTBOOKS">EDUCATION_AND_TEXTBOOKS - Educational content</option>
                                <option value="BOOKS_PERIODICALS_AND_NEWSPAPERS">BOOKS_PERIODICALS_AND_NEWSPAPERS - Publications</option>
                                <option value="COLLECTIBLES">COLLECTIBLES - Collectible items</option>
                                <option value="CLOTHING_SHOES_AND_ACCESSORIES">CLOTHING_SHOES_AND_ACCESSORIES - Fashion</option>
                                <option value="ELECTRONICS_AND_COMPUTERS">ELECTRONICS_AND_COMPUTERS - Electronics</option>
                                <option value="TOYS_AND_HOBBIES">TOYS_AND_HOBBIES - Toys and hobbies</option>
                                <option value="OTHER">OTHER - Other categories</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Can be updated later</p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="item_description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                        </label>
                        <textarea
                            id="item_description"
                            name="item_description"
                            required
                            maxLength={256}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter detailed item description"
                        />
                        <p className="text-xs text-gray-500 mt-1">Maximum 256 characters. Be specific about what you&apos;re offering.</p>
                    </div>

                    <div>
                        <label htmlFor="paypal_home_url" className="block text-sm font-medium text-gray-700 mb-1">
                            Home URL
                        </label>
                        <input
                            type="url"
                            id="paypal_home_url"
                            name="paypal_home_url"
                            defaultValue="https://themiracle.love"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://themiracle.love"
                        />
                        <p className="text-xs text-gray-500 mt-1">URL where customers can learn more about the product. Must use HTTPS.</p>
                    </div>
                </div>

                {/* Information Box */}
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Item Creation Notes:</h4>
                    <ul className="text-xs space-y-1">
                        <li>• Items are automatically synced to PayPal catalog when possible</li>
                        <li>• If PayPal sync fails, items are saved locally and can be synced later</li>
                        <li>• All PayPal products are verified after creation for reliability</li>
                        <li>• PayPal Product Type cannot be changed after creation</li>
                        <li>• Image URLs must use HTTPS protocol for PayPal</li>
                        <li>• Environment: {process.env.NODE_ENV === 'development' ? 'PayPal Sandbox (Test)' : 'PayPal Live (Production)'}</li>
                    </ul>
                </div>

                <div className="flex justify-end">
                    <SubmitButton isSubmitting={isSubmitting} />
                </div>
            </form>
        </div>
    );
}