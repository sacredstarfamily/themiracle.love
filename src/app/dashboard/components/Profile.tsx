import { User } from "@/lib/definitions";


export default function Profile(user: User) {
    return (
        <div className="flex flex-1 flex-col justify-center align-middle">
            <h1 className="self-center text-3xl">Profile</h1>
            <div className="flex flex-col justify-center align-middle">
                <h2 className="self-center">{user.name}</h2>
                <h2 className="self-center">Email:{user.email}</h2>
            </div>
        </div>
    )
}