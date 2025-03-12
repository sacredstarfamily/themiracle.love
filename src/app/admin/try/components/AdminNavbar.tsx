'use client'
import AdminNavDesk from "./AdminNavDesk";
import AdminNavMobile from "./AdminNavMobile";
import AdminNavMobileBtn from "./AdminNavMobileBtn";
import { useState } from "react";

export type AdminNavBarProps = {
    toggleView: (view: string) => void;
}
export default function AdminNavbar({ toggleView }: AdminNavBarProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const handleViewChange = (view: string) => {
        toggleView(view);
    }
    const handleDrawerToggle = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };
    return (
        <>
            <div className="hidden relative py-0 sm:flex flex-col justify-center">
                <AdminNavDesk toggleView={(i) => handleViewChange(i)} />
            </div>
            <div className="sm:hidden relative flex flex-row my-0">
                <AdminNavMobileBtn onClick={handleDrawerToggle} />

                <AdminNavMobile toggleView={(i) => handleViewChange(i)} isOpen={isDrawerOpen} onClose={handleDrawerToggle} />

            </div>
        </>
    )
}