'use client';
import { lazy, Suspense, useMemo, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import AdminNavbar from "./try/components/AdminNavbar";

// Lazy load heavy components
const UsersComponent = lazy(() => import("./components/UsersComponent"));
const ProductsComponent = lazy(() => import("./components/ProductsComponent"));

// Loading component for suspense
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
);

export default function AdminPage() {
    const [viewState, setViewState] = useState('dashboard');

    const viewToggle = (view: string) => {
        setViewState(view)
    }

    // Memoize the rendered content to prevent unnecessary re-renders
    const renderContent = useMemo(() => {
        switch (viewState) {
            case "dashboard":
                return <h1>Dashboard</h1>;
            case "users":
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <UsersComponent />
                    </Suspense>
                );
            case "products":
                return (
                    <Suspense fallback={<LoadingSpinner />}>
                        <ProductsComponent />
                    </Suspense>
                );
            default:
                return <h1>Dashboard</h1>;
        }
    }, [viewState]);

    return (
        <>
            <Navbar />
            <AdminNavbar toggleView={viewToggle} />
            <div className="mt-12 h-screen overflow-scroll p-1 mx-1 border-2 border-indigo-500 rounded">
                {renderContent}
            </div>
            <Footer />
        </>
    )
}