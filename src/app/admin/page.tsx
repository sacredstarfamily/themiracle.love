'use client';
import { useEffect, useState } from "react";
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import { getAllUsers, deleteUser } from "@/actions/adminActions"
import {User} from '@/lib/definitions';

export default function AdminPage() {
    const [users, setUsers] = useState<User[] | null>();
  
   const deletePerson = async (email: string) => {
         await deleteUser(email);
            location.reload();
    }
    useEffect(() => {
       const fetchUsers = async () => {
            const users = await getAllUsers();
            setUsers(users);
        }
        fetchUsers();
    }, []);
    return (
        <div>
            <Navbar />
            <h1>Admin Page</h1>
            <div className="flex h-screen flex-3 flex-col justify-center px-6 py-12 lg:px-8">
                <h2 className="text-center">Members</h2>
                <ul>
                    {users?.map((user) => (
                        <li key={user.id}>
                            <p>{user.name}</p>
                            <p>{user.email}</p>
                            <button onClick={()=>{deletePerson(user.email)}}>Remove</button>
                        </li>
                    ))}
                </ul>
                <h2>Admins</h2>
                </div>
            <Footer />
        </div>
    )
}