export type AdminDeskNavProps = {
    toggleView: (view: string) => void;
}
export default function AdminNavDesk({ toggleView }: AdminDeskNavProps) {
    const handleViewChange = (view: string) => {
        toggleView(view);
    }

    return (
        <ul className="absolute mt-3 left-3 flex flex-row space-x-4 font-[family-name:var(--font-cheri)]">
            <li className="text-lg hover:text-blue-900 hover:font-semibold cursor-pointer sfont-[family-name:var(--font-cheri)]" onClick={() => handleViewChange('dashboard')} >Dashboard</li>
            <li className="text-lg hover:text-blue-900 hover:font-semibold cursor-pointer font-[family-name:var(--font-cheri)]" onClick={() => handleViewChange('products')}>products</li>
            <li className="text-lg hover:text-blue-900 hover:font-semibold cursor-pointer font-[family-name:var(--font-cheri)]" onClick={() => handleViewChange('users')}>Users</li>
        </ul>
    )
}