import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
            className={`fixed flex flex-col rounded-tr-xl justify-center border-2 border-sky-500 items-center z-10 top-20 left-0 h-full w-1/2 bg-pink-300 text-rose-950 transition-transform duration-300 transform ${isOpen ? "-translate-x-0 w-1/2" : "-translate-x-full"
                }`}
        >
            <button className="absolute right-2 top-1 p-3 text-indigo-500" onClick={onClose}>
                <FontAwesomeIcon className="text-5xl text-indigo-500" icon={faXmark} />
            </button>
            <ul className="flex flex-col right-0 space-y-4">
                <li><button onClick={() => { handleViewChange('dashboard'); onClose() }}>Dashboard</button></li>
                <li><button onClick={() => { handleViewChange('users'); onClose() }}>Users</button></li>
                <li><button onClick={() => { handleViewChange('products'); onClose() }}>Products</button></li>
            </ul>
        </div>
    );
}