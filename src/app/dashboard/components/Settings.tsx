import { User } from "@/lib/definitions";

export default function Settings(user: User) {
    return (
        <div className="flex flex-1 flex-col justify-center align-middle">
            <h1>Settings</h1>
            <h2>{user.email}</h2>
        </div>
    )
}