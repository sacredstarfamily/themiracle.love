'use client';
import { deleteUser, getAllUsersPag } from '@/actions/adminActions';
import { JsonValue } from '@prisma/client/runtime/library';
import { useEffect, useState } from "react";

interface User {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
    walletAddress: string | null;
    wallets: JsonValue; // This matches the Json type from Prisma schema
    location: JsonValue; // This matches the Json type from Prisma schema
    verificationToken: string;
    sessionToken: string | null;
    passwordResetLink: string | null;
    passwordResetToken: number | null;
    passwordResetExpiry: Date | null;
}

interface PaginatedUsersResponse {
    users: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export default function UsersComponent() {
    const [usersData, setUsersData] = useState<PaginatedUsersResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const deletePerson = async (email: string) => {
        setLoading(true);
        await deleteUser(email);
        const data = await getAllUsersPag(currentPage);
        setUsersData(data);
        setLoading(false);
    }

    const fetchUsers = async (page: number) => {
        setLoading(true);
        const data = await getAllUsersPag(page);
        setUsersData(data);
        setLoading(false);
    }

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    }

    return (
        <div className="mx-3 mt-5 border-2 p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Users</h1>
                {usersData && (
                    <span className="text-sm text-gray-600">
                        Total: {usersData.pagination.total} users
                    </span>
                )}
            </div>

            {loading && <p className="text-center">Loading...</p>}

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-3 py-2 text-left">ID</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">Name</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">Email</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Verified</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">Wallet</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">Location</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Session</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Reset Token</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersData?.users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-3 py-2 text-xs">{user.id}</td>
                                <td className="border border-gray-300 px-3 py-2">{user.name || 'N/A'}</td>
                                <td className="border border-gray-300 px-3 py-2">{user.email}</td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                    <span className={`px-2 py-1 rounded text-xs ${user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.emailVerified ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-xs">
                                    {user.walletAddress ? user.walletAddress.substring(0, 10) + '...' : 'None'}
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-xs">
                                    {user.location ? JSON.stringify(user.location).substring(0, 20) + '...' : 'None'}
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                    <span className={`px-2 py-1 rounded text-xs ${user.sessionToken ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {user.sessionToken ? 'Active' : 'None'}
                                    </span>
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                    {user.passwordResetToken ? (
                                        <span className="text-xs text-orange-600">Pending</span>
                                    ) : (
                                        <span className="text-xs text-gray-500">None</span>
                                    )}
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                    <button
                                        onClick={() => deletePerson(user.email)}
                                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {usersData && usersData.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!usersData.pagination.hasPrev || loading}
                        className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
                    >
                        Previous
                    </button>

                    <span className="px-4 py-2 text-sm">
                        Page {usersData.pagination.page} of {usersData.pagination.totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!usersData.pagination.hasNext || loading}
                        className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}