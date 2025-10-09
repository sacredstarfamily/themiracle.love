import { useState } from "react";
import DeskDashNav from "./DeskDashNav";
import MobileDashNav from "./MobileDashNav";
import MobileDashNavBtn from './MobileNavButton';
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
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center space-x-8">
                        <button
                            onClick={() => toggleView('profile')}
                            className="py-4 px-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => toggleView('settings')}
                            className="py-4 px-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => toggleView('mint')}
                            className="py-4 px-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
                        >
                            Mint NFTs
                        </button>
                    </div>
                </div>
            </nav>
        </>
    )
}