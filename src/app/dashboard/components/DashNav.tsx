import { useState } from "react";
import MobileDashNav from "./MobileDashNav";
import MobileDashNavBtn from './MobileNavButton';
import DeskDashNav from "./DeskDashNav";
export type NavbarProps = {
    toggleView: (view: string) => void
}
export default function DashNav({ toggleView }: NavbarProps) {
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
                <DeskDashNav toggleView={(i) => handleViewChange(i)} />
            </div>
            <div className="sm:hidden relative flex flex-row mt-0 mb-2">
                <MobileDashNavBtn onClick={handleDrawerToggle} />

                <MobileDashNav toggleView={(i) => handleViewChange(i)} isOpen={isDrawerOpen} onClose={handleDrawerToggle} />

            </div>
        </>
    )
}