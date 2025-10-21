'use client';

import { lazy, Suspense, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

// Lazy load heavy components
const UsersComponent = lazy(() => import("./components/UsersComponent"));
const ProductsComponent = lazy(() => import("./components/ProductsComponent"));

// Loading component for suspense
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
);

type AdminView = 'products' | 'users' | 'orders' | 'settings';

export default function AdminPage() {
    const [currentView, setCurrentView] = useState<AdminView>('products');

    const renderView = () => {
        switch (currentView) {
            case 'products':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ProductsComponent />
                    </Suspense>
                );
            case 'users':
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <UsersComponent />
                    </Suspense>
                );
            case 'orders':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Orders Management</h2>
                        <p className="text-gray-600">Orders management coming soon...</p>
                    </div>
                );
            case 'settings':
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Admin Settings</h2>
                        <p className="text-gray-600">Admin settings coming soon...</p>
                    </div>
                );
            default:
                return <ProductsComponent />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Main Content with proper top spacing */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pt-24">
                {/* Admin Navigation - Optimized sticky positioning */}
                <div className="admin-nav-sticky bg-white shadow-sm border-b mb-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setCurrentView('products')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${currentView === 'products'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Products
                            </button>
                            <button
                                onClick={() => setCurrentView('users')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${currentView === 'users'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Users
                            </button>
                            <button
                                onClick={() => setCurrentView('orders')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${currentView === 'orders'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Orders
                            </button>
                            <button
                                onClick={() => setCurrentView('settings')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${currentView === 'settings'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Settings
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white rounded-lg shadow">
                        {renderView()}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}