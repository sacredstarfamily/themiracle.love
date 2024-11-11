"use server";

import prisma from "../lib/pc";


export async function getAllUsers() {
    try {
        return await prisma.user.findMany();
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Could not fetch users");
    }
}
export async function deleteUser(email: string) {
    try {
        return await prisma.user.delete({
            where: {
                email
            }
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        throw new Error("Could not delete user");
    }
}