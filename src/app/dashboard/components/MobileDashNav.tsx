import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ConnectButton from "./ConnectButton";
type MobileDashNavProps = {
    isOpen: boolean;
    onClose: () => void;
    toggleView: (view: string) => void;
};

export default function MobileDashNav({ isOpen, onClose, toggleView }: MobileDashNavProps) {
    const handleViewChange = (view: string) => {
        toggleView(view);
    }

    return (
        <div
            className={`fixed flex flex-col rounded-tr-xl h-1/2 overflow-scroll justify-center border-sky-500 items-center z-10 top-23 left-0  w-1/2 bg-pink-300 text-rose-950 transition-transform duration-300 transform ${isOpen ? "-translate-x-0 w-1/2" : "-translate-x-full"
                }`}
        >
            <button className="absolute right-2 top-1 p-3 text-indigo-500" onClick={onClose}>
                <FontAwesomeIcon className="text-5xl text-indigo-500" icon={faXmark} />
            </button>
            <ul className="flex flex-col space-y-4 mb-1 overflow-scroll">
                <ConnectButton />
                <li><button onClick={() => { handleViewChange('profile'); onClose() }}>Profile</button></li>
                <li><button onClick={() => { handleViewChange('mint'); onClose() }}>Mint</button></li>
                <li><button onClick={() => { handleViewChange('settings'); onClose() }}>Settings</button></li>

            </ul>
        </div>
    );
}