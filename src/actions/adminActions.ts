"use server";

import prisma from "../lib/pc";

import { PayPalInterface } from "./paypalActions";
import fs, { writeFile } from "fs";

import path from "path";

export type Formstate = {
    data: string | null;
}
export async function uploadImage(formData: FormData) {
    const file = formData.get("item_image") as File;
    const buffer = new Uint8Array(await file?.arrayBuffer());
    const filename = Date.now() + file.name.replaceAll(" ", "_");
    console.log(filename);

    if (!file) {
        return;
    }
    const filePath = path.join(process.cwd(), "/public/uploads/" + filename);
    try {
        if (!fs.existsSync(filePath)) {
            writeFile(filePath, buffer, (err) => {
                console.log(filePath);
                if (err) {
                    throw err;
                }
            });
            return { img_url: "/uploads/" + filename }
        }
    } catch (error) {
        console.error("Error writing file:", error);
        throw new Error("Could not write file");
    }

}
export async function addItem(
    prevState: Formstate | undefined,
    formData: FormData,
) {
    const name = formData.get("item_name") as string;
    const paypal = new PayPalInterface();
    const price = Number(formData.get("item_price"));
    const quantity = Number(formData.get("item_quantity"));

    if (formData.get("item_image")) {
        const iurl = await uploadImage(formData);
        const addedItem = await prisma.item.create({
            data: {
                name,
                price,
                img_url: iurl!.img_url,
                quantity
            }
        });
        if (addedItem) {
            paypal.createItem(name, "blah", price, "https://themiracle.love/uploads" + iurl!.img_url)
            return { ...prevState, data: "added Item" }
        }
        else {
            return { ...prevState, data: 'c' };
        }


    }


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