import ConnectButton from "./ConnectButton";




type DeskDashNavProps = {
    toggleView: (view: string) => void;
}

export default function DeskDashNav({ toggleView }: DeskDashNavProps) {

    const handleViewChange = (view: string) => {
        toggleView(view);
    }
    return (
        <ul className="absolute mt-3 left-3 flex flex-row space-x-4 font-[family-name:var(--font-cheri)] text-blue-500 cursor-pointer">
            <li onClick={() => { handleViewChange('profile') }} className="text-lg hover:text-blue-900 hover:font-semibold font-[family-name:var(--font-cheri)]">Profile</li>
            <li onClick={() => { handleViewChange('settings') }} className="text-lg hover:text-blue-900 hover:font-semibold font-[family-name:var(--font-cheri)]">Settings</li>
            <ConnectButton />
        </ul>
    )
}