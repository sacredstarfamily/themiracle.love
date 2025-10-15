'use client';
import { addItem } from "@/actions/adminActions";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

export default function AddItemForm() {
    const INITIAL_STATE = {
        data: "",
    }
    const { pending } = useFormStatus();
    const [formState, formAction] = useFormState(addItem, INITIAL_STATE);
    const [showForm, setShowForm] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        // Reset the file input
        const fileInput = document.getElementById('item_image') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    useEffect(() => {
        if (formState?.data) {
            console.log("Form state received:", formState.data);

            if (formState.data.includes("successfully")) {
                alert(formState.data);
                setShowForm(false);
                // Clear form state
                setSelectedImage(null);
                setImagePreview(null);
            } else if (formState.data.includes("PayPal catalog creation failed")) {
                alert("Item created in database, but PayPal catalog creation failed. This is normal in sandbox mode.");
                setShowForm(false);
                setSelectedImage(null);
                setImagePreview(null);
            } else if (formState.data.includes("Failed")) {
                alert("Error: " + formState.data);
            }
        }
    }, [formState]);

    return (
        <div className="mx-3 mt-5 border-2 p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Item</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                    {showForm ? 'Cancel' : 'Add Item'}
                </button>
            </div>
            {showForm && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <form action={formAction} className="space-y-4">
                        {/* Item Name */}
                        <div className="relative">
                            <input
                                type="text"
                                name="item_name"
                                id="item_name"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
                                placeholder="Enter item name"
                                required
                            />
                            <label htmlFor="item_name" className="absolute left-4 -top-2 bg-white px-2 text-sm text-gray-600 font-medium">
                                Item Name
                            </label>
                        </div>

                        {/* Price and Quantity Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    name="item_price"
                                    id="item_price"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
                                    placeholder="0.00"
                                    required
                                />
                                <label htmlFor="item_price" className="absolute left-4 -top-2 bg-white px-2 text-sm text-gray-600 font-medium">
                                    Price ($)
                                </label>
                            </div>

                            <div className="relative">
                                <input
                                    type="number"
                                    name="item_quantity"
                                    id="item_quantity"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200 font-medium text-gray-900 placeholder:text-gray-500 placeholder:font-normal"
                                    placeholder="0"
                                    required
                                />
                                <label htmlFor="item_quantity" className="absolute left-4 -top-2 bg-white px-2 text-sm text-gray-600 font-medium">
                                    Quantity
                                </label>
                            </div>
                        </div>

                        {/* Enhanced Image Upload with Preview */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Product Image
                            </label>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="relative inline-block">
                                    <div className="relative w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                                        <Image
                                            src={imagePreview}
                                            alt="Image preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                    <div className="mt-2 text-xs text-gray-600 text-center">
                                        {selectedImage?.name}
                                    </div>
                                </div>
                            )}

                            {/* Upload Area */}
                            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${imagePreview ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400'
                                }`}>
                                <div className="mb-4">
                                    {imagePreview ? (
                                        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    name="item_image"
                                    id="item_image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    required
                                />
                                <label htmlFor="item_image" className="cursor-pointer">
                                    {imagePreview ? (
                                        <>
                                            <span className="text-green-600 font-medium">Image selected!</span>
                                            <p className="text-xs text-gray-500 mt-1">Click to change image</p>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-blue-600 font-medium hover:text-blue-500">Click to upload</span>
                                            <span className="text-gray-500"> or drag and drop</span>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Error/Success Message */}
                        {formState?.data && (
                            <div className={`p-4 rounded-lg ${formState.data.includes('added') || formState.data.includes('successfully') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <p className={`text-sm ${formState.data.includes('added') || formState.data.includes('successfully') ? 'text-green-700' : 'text-red-700'}`}>
                                    {formState.data}
                                </p>
                            </div>
                        )}

                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                            <p><strong>PayPal Integration:</strong></p>
                            <p>• Development: Uses PayPal Sandbox with placeholder images</p>
                            <p>• Production: Uses PayPal Live with actual uploaded images</p>
                            <p>• Current: {process.env.NODE_ENV === 'development' ? 'SANDBOX' : 'LIVE'} mode</p>
                            <p>• Home URL: Always uses https://themiracle.love</p>

                            {imagePreview && process.env.NODE_ENV === 'development' && (
                                <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
                                    <p><strong>Development Note:</strong></p>
                                    <p>PayPal will use a placeholder image instead of your uploaded image</p>
                                    <p className="text-gray-500 mt-1">
                                        Placeholder: https://via.placeholder.com/400x400.png?text=Product+Image
                                    </p>
                                </div>
                            )}

                            {imagePreview && process.env.NODE_ENV === 'production' && (
                                <div className="mt-2 p-2 bg-green-100 rounded text-xs">
                                    <p><strong>Production Mode:</strong></p>
                                    <p>PayPal will use your uploaded image</p>
                                    <p className="break-all text-gray-500 mt-1">
                                        Image URL: https://themiracle.love/uploads/{selectedImage?.name}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={pending || !selectedImage}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {pending ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding Item...
                                </div>
                            ) : (
                                'Add Item'
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}