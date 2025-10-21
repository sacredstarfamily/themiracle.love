'use client'
import { memo, useCallback, useState } from "react";
import AdminNavDesk from "./AdminNavDesk";
import AdminNavMobile from "./AdminNavMobile";
import AdminNavMobileBtn from "./AdminNavMobileBtn";

export type AdminNavBarProps = {
    toggleView: (view: string) => void;
}

function AdminNavbar({ toggleView }: AdminNavBarProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Memoize callbacks to prevent child re-renders
    const handleViewChange = useCallback((view: string) => {
        toggleView(view);
    }, [toggleView]);

    const handleDrawerToggle = useCallback(() => {
        setIsDrawerOpen(prev => !prev);
    }, []);

    return (
        <div className="bg-white shadow-sm border-b sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12">
                    <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                    <div className="text-sm text-gray-500">
                        Manage your application
                    </div>
                </div>
            </div>
            <div className="hidden relative py-0 sm:flex flex-col justify-center">
                <AdminNavDesk toggleView={handleViewChange} />
            </div>
            <div className="sm:hidden relative flex flex-row my-0">
                <AdminNavMobileBtn onClick={handleDrawerToggle} />
                <AdminNavMobile
                    toggleView={handleViewChange}
                    isOpen={isDrawerOpen}
                    onClose={handleDrawerToggle}
                />
            </div>
        </div>
    )
}

// Export memoized component to prevent unnecessary re-renders
export default memo(AdminNavbar);