'use client';
import { getAllUsers, deleteUser } from '@/actions/adminActions';
import { User } from "@/lib/definitions";
import { useState, useEffect } from "react";
export default function UsersComponent() {
    const [users, setUsers] = useState<User[] | null>()

    const deletePerson = async (email: string) => {
        await deleteUser(email);
        const users = await getAllUsers();
        setUsers(users)

    }
    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getAllUsers();
            setUsers(users);
        }
        fetchUsers();
    }, []);
    return (
        <div className="mx-3 mt-5 border-2">
            <h1>Users</h1>
            <ul>
                {users?.map((user) => (
                    <li key={user.id}>
                        <p>{user.name}</p>
                        <p>{user.email}</p>
                        <button onClick={() => { deletePerson(user.email) }}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}