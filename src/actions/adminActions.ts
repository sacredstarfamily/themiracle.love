"use server";

import prisma from "../lib/pc";

import fs, { writeFile } from "fs";
import { PayPalInterface } from "./paypalActions";

import path from "path";
import { syncPayPalCatalog } from "./actions";

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
            return { img_url: "/public/uploads/" + filename }
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
    const item_name = formData.get("item_name") as string;
    const price = Number(formData.get("item_price"));
    const quantity = Number(formData.get("item_quantity"));

    if (formData.get("item_image")) {
        const iurl = await uploadImage(formData);

        if (!iurl) {
            return { ...prevState, data: 'Image upload failed' };
        }

        let paypalProductId = null;
        let paypalCreationResult = "";

        try {
            // Try to create PayPal product first
            const paypal = new PayPalInterface();
            const fullImageUrl = "https://themiracle.love" + iurl.img_url;
            console.log("Attempting to create PayPal product with image URL:", fullImageUrl);

            const paypalProduct = await paypal.createItem(
                item_name,
                `Product: ${item_name} - Price: $${price}`,
                price,
                fullImageUrl
            );
            paypalProductId = paypalProduct.id;
            paypalCreationResult = "PayPal product created successfully";
            console.log("PayPal product created with ID:", paypalProductId);
        } catch (paypalError) {
            console.error("PayPal product creation failed:", paypalError);
            paypalCreationResult = "PayPal catalog creation failed";
            console.log(paypalCreationResult);
            // Continue without PayPal product ID - we'll create the item anyway
        }

        try {
            // Create item in database
            const addedItem = await prisma.item.create({
                data: {
                    name: item_name,
                    price,
                    img_url: iurl.img_url,
                    quantity,
                    paypal_product_id: paypalProductId // This will be null if PayPal creation failed
                }
            });

            if (addedItem) {
                const message = paypalProductId
                    ? "Item added successfully to both database and PayPal catalog"
                    : "Item added to database (PayPal catalog creation failed - this is normal for sandbox testing)";
                console.log(message);
                return { ...prevState, data: message }
            }
        } catch (error) {
            console.error("Error creating item in database:", error);

            // If database creation fails but PayPal succeeded, try to clean up PayPal product
            if (paypalProductId) {
                try {
                    const paypal = new PayPalInterface();
                    await paypal.deleteProduct(paypalProductId);
                    console.log("Cleaned up PayPal product after database failure");
                } catch (cleanupError) {
                    console.error("Failed to clean up PayPal product:", cleanupError);
                }
            }

            return { ...prevState, data: 'Failed to create item in database' };
        }
    }
    return { ...prevState, data: 'No image provided' };
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
        // First get the item to check if it has a PayPal product ID
        const item = await prisma.item.findUnique({
            where: { id }
        });

        if (!item) {
            throw new Error("Item not found");
        }

        let paypalDeletionSuccess = true;
        let paypalMessage = "";

        // Delete from PayPal catalog if it exists there
        if (item.paypal_product_id) {
            try {
                const paypal = new PayPalInterface();
                await paypal.deleteProduct(item.paypal_product_id);
                console.log("Item deleted from PayPal catalog successfully");
                paypalMessage = "Deleted from PayPal catalog";
            } catch (paypalError) {
                // Check if it's a 404 error (product doesn't exist in PayPal)
                if (paypalError instanceof Error && paypalError.message.includes('404')) {
                    console.log(`PayPal product ${item.paypal_product_id} not found - likely already deleted or never existed`);
                    paypalMessage = "PayPal product already deleted or never existed";
                    paypalDeletionSuccess = true; // Consider it successful since the product doesn't exist anyway
                } else {
                    console.warn("PayPal deletion failed but continuing with local deletion:", paypalError instanceof Error ? paypalError.message : paypalError);
                    paypalMessage = "PayPal deletion failed";
                    paypalDeletionSuccess = false;
                }
            }
        } else {
            paypalMessage = "No PayPal product ID associated";
        }

        // Delete from local database
        const deletedItem = await prisma.item.delete({
            where: { id }
        });

        console.log(`Item deleted successfully. Local: ✓, PayPal: ${paypalDeletionSuccess ? '✓' : '✗'} (${paypalMessage})`);

        return {
            ...deletedItem,
            paypalDeleted: paypalDeletionSuccess,
            paypalMessage
        };
    } catch (error) {
        console.error("Error deleting item:", error);
        throw new Error(`Could not delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export async function getAllUsersPag(page: number = 1, limit: number = 10) {
    try {
        const skip = (page - 1) * limit;

        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    emailVerified: true,
                    walletAddress: true,
                    wallets: true,
                    location: true,
                    verificationToken: true,
                    sessionToken: true,
                    passwordResetLink: true,
                    passwordResetToken: true,
                    passwordResetExpiry: true,
                    // Explicitly exclude hashedPassword
                },
                orderBy: {
                    id: 'desc'
                }
            }),
            prisma.user.count()
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNext: page < Math.ceil(totalCount / limit),
                hasPrev: page > 1
            }
        };
    } catch (error) {
        console.error("Error fetching paginated users:", error);
        throw new Error("Could not fetch paginated users");
    }
}
export async function syncPayPalCatalogAction() {
    try {
        const results = await syncPayPalCatalog();
        return {
            success: true,
            data: results,
            message: `Sync completed: ${results.created} created, ${results.updated} updated, ${results.errors} errors`
        };
    } catch (error) {
        console.error("Sync PayPal catalog error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}