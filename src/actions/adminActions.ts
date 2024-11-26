"use server";

import prisma from "../lib/pc";
export type Formstate = {
    data: string | null;
}
export async function addItem(
    prevState: Formstate | undefined,
    formData: FormData,
) {
    const name = formData.get("item_name") as string;
    const price = Number(formData.get("item_price"));
    const quantity = Number(formData.get("item_quantity"));

    console.log(name, price, quantity);
    const addedItem = await prisma.item.create({
        data: {
            name,
            price,
            quantity
        }
    });
    if (addedItem) {
        return { ...prevState, data: 'a' };
    }
    return { ...prevState, data: 'b' };
}
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
export async function deleteItem(id: string) {
    try {
        return await prisma.item.delete({
            where: {
                id
            }
        });
    } catch (error) {
        console.error("Error deleting item:", error);
        throw new Error("Could not delete item");
    }
}