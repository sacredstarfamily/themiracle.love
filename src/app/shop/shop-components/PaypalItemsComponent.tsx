'use client';

import { PayPalInterface } from "@/actions/paypalActions";
import { Spinner } from "@/components/icons";
import Image from "next/image";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";

interface PayPalItem {
    id: string;
    name: string;
    description?: string;
    type?: string;
    category?: string;
    image_url?: string;
    home_url?: string;
    create_time?: string;
    update_time?: string;
}

interface CreateItemForm {
    name: string;
    description: string;
    type: string;
    category: string;
    imageUrl: string;
    homeUrl: string;
    price: number;
}

interface UpdateItemForm {
    name?: string;
    description?: string;
    type?: string;
    category?: string;
    image_url?: string;
    home_url?: string;
}

interface PaypalItemsComponentProps {
    onItemsChanged?: () => Promise<void> | void;
}

interface PaypalItemsComponentHandle {
    refreshItems: () => Promise<void>;
}

const PaypalItemsComponent = forwardRef<PaypalItemsComponentHandle, PaypalItemsComponentProps>(
    ({ onItemsChanged }, ref) => {
        const [items, setItems] = useState<PayPalItem[]>([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [creating, setCreating] = useState(false);
        const [updating, setUpdating] = useState<string | null>(null);
        const [selectedItem, setSelectedItem] = useState<PayPalItem | null>(null);

        // Add filter state
        const [searchFilter, setSearchFilter] = useState('');
        const [totalFetched, setTotalFetched] = useState(0);

        // Form states
        const [createForm, setCreateForm] = useState<CreateItemForm>({
            name: '',
            description: '',
            type: 'SERVICE',
            category: 'SOFTWARE',
            imageUrl: '',
            homeUrl: 'https://themiracle.love',
            price: 0
        });

        const [updateForm, setUpdateForm] = useState<UpdateItemForm>({});
        const [showCreateForm, setShowCreateForm] = useState(false);
        const [showUpdateForm, setShowUpdateForm] = useState(false);

        const fetchPayPalItems = useCallback(async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('🔄 Fetching all PayPal catalog items...');
                const paypal = new PayPalInterface();
                const response = await paypal.getItems();

                const itemCount = response.products?.length || 0;
                console.log(`✅ Successfully fetched ${itemCount} PayPal catalog items`);

                setItems(response.products || []);
                setTotalFetched(itemCount);
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Failed to fetch PayPal items';
                setError(errorMsg);
                console.error('Error fetching PayPal items:', err);
                setTotalFetched(0);
            } finally {
                setLoading(false);
            }
        }, []);

        // Expose refresh function via ref
        useImperativeHandle(ref, () => ({
            refreshItems: fetchPayPalItems
        }), [fetchPayPalItems]);

        // Load items only once on mount
        useEffect(() => {
            fetchPayPalItems();
        }, [fetchPayPalItems]); // Added missing dependency

        const createPayPalItem = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!createForm.name.trim()) {
                alert('Item name is required');
                return;
            }

            setCreating(true);
            try {
                const paypal = new PayPalInterface();

                // Use placeholder image if none provided
                const imageUrl = createForm.imageUrl.trim() ||
                    (process.env.NODE_ENV === 'development'
                        ? "https://via.placeholder.com/400x400.png?text=Product+Image"
                        : "https://themiracle.love/themiracle.png"
                    );

                const homeUrl = createForm.homeUrl.trim() || 'https://themiracle.love';

                const newItem = await paypal.createItem(
                    createForm.name,
                    createForm.description || `${createForm.name} - Price: $${createForm.price}`,
                    createForm.price,
                    imageUrl,
                    createForm.type,
                    createForm.category,
                    homeUrl
                );

                console.log('PayPal item created:', newItem);
                alert(`✅ PayPal item "${createForm.name}" created successfully!\nProduct ID: ${newItem.id}`);

                // Reset form and refresh items
                setCreateForm({
                    name: '',
                    description: '',
                    type: 'SERVICE',
                    category: 'SOFTWARE',
                    imageUrl: '',
                    homeUrl: 'https://themiracle.love',
                    price: 0
                });
                setShowCreateForm(false);
                await fetchPayPalItems();

                // Notify parent component
                if (onItemsChanged) {
                    try {
                        await onItemsChanged();
                    } catch (error) {
                        console.error('Error in onItemsChanged callback:', error);
                    }
                }

            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Failed to create PayPal item';
                console.error('Error creating PayPal item:', err);
                alert(`❌ Failed to create PayPal item:\n${errorMsg}`);
            } finally {
                setCreating(false);
            }
        };

        const updatePayPalItem = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!selectedItem) return;

            // Only include fields that have values and filter out invalid fields
            const validUpdates: {
                name?: string;
                description?: string;
                category?: string;
                image_url?: string;
                home_url?: string;
            } = {};

            if (updateForm.name && updateForm.name.trim()) {
                validUpdates.name = updateForm.name.trim();
            }

            if (updateForm.description && updateForm.description.trim()) {
                validUpdates.description = updateForm.description.trim();
            }

            if (updateForm.category && updateForm.category.trim()) {
                // Ensure category is valid PayPal category
                const validCategories = ['SOFTWARE', 'DIGITAL_GOODS', 'PHYSICAL_GOODS', 'SERVICE'];
                const category = updateForm.category.trim().toUpperCase();
                if (validCategories.includes(category)) {
                    validUpdates.category = category;
                }
            }

            if (updateForm.image_url && updateForm.image_url.trim()) {
                // Basic URL validation
                try {
                    new URL(updateForm.image_url.trim());
                    validUpdates.image_url = updateForm.image_url.trim();
                } catch {
                    alert('Invalid image URL format');
                    return;
                }
            }

            if (updateForm.home_url && updateForm.home_url.trim()) {
                // Basic URL validation
                try {
                    new URL(updateForm.home_url.trim());
                    validUpdates.home_url = updateForm.home_url.trim();
                } catch {
                    alert('Invalid home URL format');
                    return;
                }
            }

            if (Object.keys(validUpdates).length === 0) {
                alert('No valid updates provided');
                return;
            }

            setUpdating(selectedItem.id);
            try {
                const paypal = new PayPalInterface();
                await paypal.updateProduct(selectedItem.id, validUpdates);

                console.log('PayPal item updated:', selectedItem.id);
                alert(`✅ PayPal item "${selectedItem.name}" updated successfully!`);

                // Reset form and refresh items
                setUpdateForm({});
                setShowUpdateForm(false);
                setSelectedItem(null);
                await fetchPayPalItems();

                // Notify parent component
                if (onItemsChanged) {
                    try {
                        await onItemsChanged();
                    } catch (error) {
                        console.error('Error in onItemsChanged callback:', error);
                    }
                }

            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Failed to update PayPal item';
                console.error('Error updating PayPal item:', err);
                alert(`❌ Failed to update PayPal item:\n${errorMsg}`);
            } finally {
                setUpdating(null);
            }
        };

        const deletePayPalItem = async (item: PayPalItem) => {
            if (!confirm(`Are you sure you want to mark "${item.name}" as "no inventory" in PayPal catalog?`)) {
                return;
            }

            setUpdating(item.id);
            try {
                const paypal = new PayPalInterface();
                await paypal.deleteProduct(item.id);

                console.log('PayPal item marked as no inventory:', item.id);
                alert(`✅ PayPal item "${item.name}" marked as "no inventory" successfully!`);

                await fetchPayPalItems();

            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Failed to update PayPal item';
                console.error('Error updating PayPal item:', err);
                alert(`❌ Failed to update PayPal item:\n${errorMsg}`);
            } finally {
                setUpdating(null);
            }
        };

        const handleEditItem = (item: PayPalItem) => {
            setSelectedItem(item);
            setUpdateForm({
                name: item.name,
                description: item.description || '',
                type: item.type || '',
                category: item.category || '',
                image_url: item.image_url || '',
                home_url: item.home_url || ''
            });
            setShowUpdateForm(true);
            setShowCreateForm(false);
        };

        // Filter items by name
        const filteredItems = items.filter(item =>
            item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchFilter.toLowerCase())) ||
            item.id.toLowerCase().includes(searchFilter.toLowerCase())
        );

        const clearSearch = () => {
            setSearchFilter('');
        };

        return (
            <div className="space-y-6">
                {/* Enhanced Header with Total Count */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">PayPal Catalog Items</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {loading
                                ? 'Loading...'
                                : `Total items in PayPal catalog: ${totalFetched}`
                            }
                            {searchFilter && !loading && (
                                <span className="ml-2 text-blue-600">
                                    | Showing {filteredItems.length} filtered results
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => {
                                setShowCreateForm(!showCreateForm);
                                setShowUpdateForm(false);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            {showCreateForm ? 'Cancel' : 'Create Item'}
                        </button>
                        <button
                            onClick={fetchPayPalItems}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Refreshing...</span>
                                </div>
                            ) : (
                                'Refresh'
                            )}
                        </button>
                    </div>
                </div>

                {/* Search/Filter Component */}
                {!loading && items.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1">
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                    Search Items
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="search"
                                        value={searchFilter}
                                        onChange={(e) => setSearchFilter(e.target.value)}
                                        placeholder="Search by name, description, or ID..."
                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {searchFilter && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            title="Clear search"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 pt-6">
                                {searchFilter ? (
                                    <span>
                                        {filteredItems.length} of {items.length} items
                                    </span>
                                ) : (
                                    <span>
                                        {items.length} total items
                                    </span>
                                )}
                            </div>
                        </div>
                        {searchFilter && (
                            <div className="mt-2 text-xs text-gray-500">
                                <span className="font-medium">Search tip:</span> Search works across item names, descriptions, and IDs
                            </div>
                        )}
                    </div>
                )}

                {/* Environment indicator with total count */}
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium">
                                📍 Environment: {process.env.NODE_ENV === 'development' ? 'PayPal Sandbox' : 'PayPal Live'}
                            </p>
                            <p className="text-xs mt-1">
                                Items created here will appear in your PayPal {process.env.NODE_ENV === 'development' ? 'sandbox' : 'live'} catalog.
                            </p>
                        </div>
                        {totalFetched > 0 && (
                            <div className="text-right">
                                <p className="text-lg font-bold text-blue-800">{totalFetched}</p>
                                <p className="text-xs text-blue-600">Total Items</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Form */}
                {showCreateForm && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-800 mb-4">Create New PayPal Item</h3>
                        <form onSubmit={createPayPalItem} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Item Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.name}
                                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter item name"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Maximum 127 characters</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price (USD)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={createForm.price}
                                        onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                                        placeholder="0.00"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Reference price for tracking</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Type *
                                    </label>
                                    <select
                                        value={createForm.type}
                                        onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                                        required
                                    >
                                        <option value="PHYSICAL">PHYSICAL - Physical goods</option>
                                        <option value="DIGITAL">DIGITAL - Digital goods</option>
                                        <option value="SERVICE">SERVICE - Services (recommended)</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Cannot be changed after creation</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        value={createForm.category}
                                        onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                                        required
                                    >
                                        <option value="SOFTWARE">SOFTWARE - Software products</option>
                                        <option value="DIGITAL_MEDIA_BOOKS_MOVIES_MUSIC">DIGITAL_MEDIA - Digital downloads</option>
                                        <option value="BOOKS_PERIODICALS_AND_NEWSPAPERS">BOOKS_PERIODICALS_AND_NEWSPAPERS - Publications</option>
                                        <option value="ENTERTAINMENT">ENTERTAINMENT - Entertainment content</option>
                                        <option value="MUSIC">MUSIC - Music and audio</option>
                                        <option value="GAMES">GAMES - Video games</option>
                                        <option value="EDUCATION_AND_TEXTBOOKS">EDUCATION_AND_TEXTBOOKS - Educational content</option>
                                        <option value="ART_AND_CRAFTS">ART_AND_CRAFTS - Art and creative works</option>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                                    rows={3}
                                    placeholder="Enter detailed item description"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Maximum 256 characters. Be specific about what you&apos;re offering.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    value={createForm.imageUrl}
                                    onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                                    placeholder="https://example.com/image.jpg (optional)"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Public URL to product image. Must be HTTPS. Recommended: 400x400px minimum.
                                    {!createForm.imageUrl && ' If empty, will use default placeholder.'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Home URL
                                </label>
                                <input
                                    type="url"
                                    value={createForm.homeUrl}
                                    onChange={(e) => setCreateForm({ ...createForm, homeUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                                    placeholder="https://themiracle.love"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    URL where customers can learn more about the product. Must be HTTPS.
                                </p>
                            </div>

                            {/* Information Box */}
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                                <h4 className="font-medium text-sm mb-2">PayPal Product Creation Notes:</h4>
                                <ul className="text-xs space-y-1">
                                    <li>• Product Type cannot be changed after creation</li>
                                    <li>• All URLs must use HTTPS protocol</li>
                                    <li>• Images should be at least 400x400 pixels for best display</li>
                                    <li>• Products will appear in your PayPal catalog for checkout</li>
                                    <li>• Environment: {process.env.NODE_ENV === 'development' ? 'Sandbox (Test)' : 'Live (Production)'}</li>
                                </ul>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {creating ? 'Creating...' : 'Create PayPal Product'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Update Form */}
                {showUpdateForm && selectedItem && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                            Update PayPal Item: {selectedItem.name}
                        </h3>
                        <form onSubmit={updatePayPalItem} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Item Name
                                    </label>
                                    <input
                                        type="text"
                                        value={updateForm.name || ''}
                                        onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                                        placeholder="Enter new name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={updateForm.category || ''}
                                        onChange={(e) => setUpdateForm({ ...updateForm, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="">Select category</option>
                                        <option value="SOFTWARE">SOFTWARE</option>
                                        <option value="DIGITAL_MEDIA_BOOKS_MOVIES_MUSIC">DIGITAL_MEDIA</option>
                                        <option value="PHYSICAL_GOODS">PHYSICAL_GOODS</option>
                                        <option value="SERVICE">SERVICE</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={updateForm.description || ''}
                                    onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                                    rows={3}
                                    placeholder="Enter new description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    value={updateForm.image_url || ''}
                                    onChange={(e) => setUpdateForm({ ...updateForm, image_url: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                                    placeholder="https://example.com/new-image.jpg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Home URL
                                </label>
                                <input
                                    type="url"
                                    value={updateForm.home_url || ''}
                                    onChange={(e) => setUpdateForm({ ...updateForm, home_url: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                                    placeholder="https://themiracle.love"
                                />
                            </div>

                            {/* Note about limitations */}
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded text-sm">
                                <p className="font-medium">Note:</p>
                                <p>• PayPal doesn&apos;t allow updating product type after creation</p>
                                <p>• Only fields with values will be updated</p>
                                <p>• URLs must be valid format (https://...)</p>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={updating === selectedItem.id}
                                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updating === selectedItem.id ? 'Updating...' : 'Update Item'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUpdateForm(false);
                                        setSelectedItem(null);
                                        setUpdateForm({});
                                    }}
                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <p className="font-medium">Error loading PayPal items:</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <Spinner size="lg" />
                        <span className="ml-3 text-lg">Loading PayPal items...</span>
                    </div>
                )}

                {/* Items Grid - Now shows filtered items */}
                {!loading && filteredItems.length > 0 && (
                    <div className="space-y-4">
                        {/* Results header when filtering */}
                        {searchFilter && (
                            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span className="text-yellow-800 font-medium">
                                        Search Results: &quot;{searchFilter}&quot;
                                    </span>
                                </div>
                                <span className="text-yellow-700 text-sm">
                                    {filteredItems.length} of {items.length} items
                                </span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-semibold text-lg truncate">{item.name}</h4>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            PayPal
                                        </span>
                                    </div>

                                    {item.image_url && (
                                        <div className="mb-3 relative w-full h-32 overflow-hidden rounded">
                                            <Image
                                                src={item.image_url}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                                unoptimized={item.image_url.includes('placeholder') || item.image_url.includes('themiracle.love')}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                                        <p><strong>ID:</strong> {item.id}</p>
                                        {item.description && (
                                            <p><strong>Description:</strong> {item.description.substring(0, 100)}...</p>
                                        )}
                                        {item.category && (
                                            <p><strong>Category:</strong> {item.category}</p>
                                        )}
                                        {item.create_time && (
                                            <p><strong>Created:</strong> {new Date(item.create_time).toLocaleDateString()}</p>
                                        )}
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditItem(item)}
                                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deletePayPalItem(item)}
                                            disabled={updating === item.id}
                                            className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {updating === item.id ? '...' : 'Mark No Stock'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results State */}
                {!loading && searchFilter && filteredItems.length === 0 && items.length > 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <div className="mb-4">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className="text-lg font-medium">No items found</p>
                        <p className="text-sm mt-2">No items match your search: &quot;<strong>{searchFilter}</strong>&quot;</p>
                        <button
                            onClick={clearSearch}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Clear Search
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg font-medium">No PayPal items found</p>
                        <p className="text-sm mt-2">Create your first PayPal catalog item to get started!</p>
                    </div>
                )}

                {/* Enhanced Stats */}
                {!loading && items.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-700 mb-2">PayPal Catalog Stats</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                                <p className="font-medium text-lg text-gray-900">{totalFetched}</p>
                                <p>Total Items</p>
                            </div>
                            <div>
                                <p className="font-medium text-lg text-gray-900">{filteredItems.length}</p>
                                <p>{searchFilter ? 'Filtered Items' : 'Displayed Items'}</p>
                            </div>
                            <div>
                                <p className="font-medium text-lg text-gray-900">
                                    {process.env.NODE_ENV === 'development' ? 'Sandbox' : 'Live'}
                                </p>
                                <p>Environment</p>
                            </div>
                            <div>
                                <p className="font-medium text-lg text-green-600">✓</p>
                                <p>All Items Fetched</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            ✓ Pagination enabled - no 20-item limit
                        </p>
                    </div>
                )}
            </div>
        );
    }
);

PaypalItemsComponent.displayName = 'PaypalItemsComponent';

export default PaypalItemsComponent;
