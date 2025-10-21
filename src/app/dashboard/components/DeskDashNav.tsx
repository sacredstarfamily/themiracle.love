import ConnectButton from "./ConnectButton";

type DeskDashNavProps = {
    toggleView: (view: string) => void;
}

export default function DeskDashNav({ toggleView }: DeskDashNavProps) {

    const handleViewChange = (view: string) => {
        toggleView(view);
    }
    return (
        <ul className="absolute mt-3 left-3 flex flex-row space-x-4 text-blue-500 cursor-pointer font-cheri">
            <li onClick={() => { handleViewChange('profile') }} className="text-lg hover:text-blue-900 hover:font-semibold font-cheri">Profile</li>
            <li onClick={() => { handleViewChange('mint') }} className="text-lg hover:text-blue-900 hover:font-semibold font-cheri">Mint</li>
            <li onClick={() => { handleViewChange('settings') }} className="text-lg hover:text-blue-900 hover:font-semibold font-cheri">Settings</li>
            <ConnectButton />
        </ul>
    )
}