'use client';

import { useState } from "react";
import PaypalItemsComponent from "../shop-components/PaypalItemsComponent";

export default function PaypalCard() {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">PayPal Catalog Management</h2>
                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {isVisible ? 'Hide PayPal Items' : 'Manage PayPal Items'}
                </button>
            </div>

            {isVisible && (
                <div className="border-t pt-4">
                    <PaypalItemsComponent />
                </div>
            )}
        </div>
    );
}