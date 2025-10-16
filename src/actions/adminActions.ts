"use server";

import prisma from "../lib/pc";

import fs, { writeFile } from "fs";
import { PayPalInterface } from "./paypalActions";

import { PayPalSyncStatus, Prisma } from "@prisma/client";
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
    console.log("=== ADD ITEM PROCESS STARTED ===");

    // Extract form data with correct field names
    const item_name = formData.get("item_name") as string;
    const price = Number(formData.get("item_price")); // Changed from "price" to "item_price"
    const quantity = Number(formData.get("item_quantity")); // Changed from "quantity" to "item_quantity"

    // Validate form data
    if (!item_name || item_name.trim().length === 0) {
        return { ...prevState, data: 'Item name is required' };
    }

    if (isNaN(price) || price <= 0) {
        return { ...prevState, data: 'Valid price greater than 0 is required' };
    }

    if (isNaN(quantity) || quantity < 0) {
        return { ...prevState, data: 'Valid quantity (0 or greater) is required' };
    }

    if (formData.get("item_image")) {
        const iurl = await uploadImage(formData);
        if (!iurl) {
            return { ...prevState, data: 'Image upload failed' };
        }

        let paypalProductId: string | null = null;
        let paypalCreationResult = "";
        const isDevelopment = process.env.NODE_ENV === 'development';

        // Try PayPal creation
        try {
            console.log("Attempting PayPal product creation...");
            const paypal = new PayPalInterface();

            const imageUrl = isDevelopment
                ? "https://via.placeholder.com/400x400.png?text=Product+Image"
                : `https://themiracle.love${iurl.img_url.replace('/public', '')}`;

            const paypalProduct = await paypal.createItem(
                item_name,
                `Product: ${item_name} - Price: $${price}`,
                price,
                imageUrl
            );

            paypalProductId = paypalProduct.id;
            paypalCreationResult = `PayPal ${isDevelopment ? 'sandbox' : 'live'} product created successfully`;
            console.log("✅ PayPal product created:", paypalProductId);
        } catch (paypalError) {
            console.error("❌ PayPal product creation failed:", paypalError);
            paypalCreationResult = "PayPal catalog creation failed";
        }

        try {
            console.log("Creating item in database...");

            const itemData = {
                name: item_name,
                price,
                img_url: iurl.img_url,
                quantity,
                paypal_product_id: paypalProductId,
                paypal_sync_status: paypalProductId ? PayPalSyncStatus.SYNCED : PayPalSyncStatus.LOCAL_ONLY,
                paypal_data: paypalProductId ? {
                    product_id: paypalProductId,
                    synced_at: new Date().toISOString(),
                    environment: process.env.NODE_ENV
                } : Prisma.JsonNull,
                paypal_last_sync: paypalProductId ? new Date() : null,
                description: `Product: ${item_name} - Price: $${price}`,
                is_active: true,
                is_digital: true,
                inventory_tracked: true,
                slug: item_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            };

            console.log("📝 Creating item with sync status:", itemData.paypal_sync_status);

            const addedItem = await prisma.item.create({
                data: itemData
            });

            console.log("✅ Item created successfully:", {
                id: addedItem.id,
                name: addedItem.name,
                paypal_sync_status: addedItem.paypal_sync_status,
                paypal_product_id: addedItem.paypal_product_id
            });

            const message = paypalProductId
                ? `✅ "${item_name}" added successfully!\n• Database: ✅ Created\n• PayPal: ✅ ${paypalCreationResult}\n• Status: SYNCED`
                : `⚠️ "${item_name}" added to database only.\n• Database: ✅ Created\n• PayPal: ❌ ${paypalCreationResult}\n• Status: LOCAL_ONLY`;

            return { ...prevState, data: message };
        } catch (error) {
            console.error("❌ Database creation failed:", error);

            // Cleanup PayPal if DB creation failed
            if (paypalProductId) {
                try {
                    const paypal = new PayPalInterface();
                    await paypal.deleteProduct(paypalProductId);
                } catch (cleanupError) {
                    console.error("Cleanup failed:", cleanupError);
                }
            }

            return { ...prevState, data: 'Failed to create item in database' };
        }
    }

    return { ...prevState, data: 'No image provided' };
}

// Add function to update sync status when syncing individual items
export async function updateItemSyncStatus(itemId: string, status: 'SYNCED' | 'LOCAL_ONLY' | 'MISSING', paypalProductId?: string) {
    try {
        const updateData: Prisma.ItemUpdateInput = {
            paypal_sync_status: status,
            paypal_last_sync: new Date()
        };

        if (paypalProductId) {
            updateData.paypal_product_id = paypalProductId;
        }

        const updatedItem = await prisma.item.update({
            where: { id: itemId },
            data: updateData
        });

        console.log(`✅ Updated item sync status: ${itemId} → ${status}`);
        return updatedItem;
    } catch (error) {
        console.error("❌ Failed to update item sync status:", error);
        throw error;
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

// Add function to sync all local items to PayPal
export async function syncLocalItemsToPayPal() {
    try {
        const localOnlyItems = await prisma.item.findMany({
            where: {
                OR: [
                    { paypal_product_id: null },
                    { paypal_sync_status: 'LOCAL_ONLY' }
                ]
            }
        });

        const syncResults = {
            synced: 0,
            skipped: 0,
            errors: 0,
            details: [] as string[]
        };

        for (const item of localOnlyItems) {
            // Skip if item already has a PayPal product ID
            if (item.paypal_product_id && item.paypal_sync_status !== 'LOCAL_ONLY') {
                syncResults.skipped++;
                syncResults.details.push(`⏭️ ${item.name}: Already has PayPal ID`);
                continue;
            }

            try {
                const paypal = new PayPalInterface();
                const isDevelopment = process.env.NODE_ENV === 'development';

                let imageUrl: string;
                if (isDevelopment) {
                    imageUrl = "https://via.placeholder.com/400x400.png?text=Product+Image";
                } else {
                    let cleanImageUrl = item.img_url;
                    if (cleanImageUrl.startsWith('/public/')) {
                        cleanImageUrl = cleanImageUrl.replace('/public', '');
                    }
                    imageUrl = `https://themiracle.love${cleanImageUrl}`;
                }

                const paypalProduct = await paypal.createItem(
                    item.name,
                    `Product: ${item.name} - Price: $${item.price} - Available: ${item.quantity}`,
                    item.price,
                    imageUrl
                );

                await prisma.item.update({
                    where: { id: item.id },
                    data: {
                        paypal_product_id: paypalProduct.id,
                        paypal_sync_status: 'SYNCED',
                        paypal_last_sync: new Date(),
                        paypal_data: {
                            product_id: paypalProduct.id,
                            synced_at: new Date().toISOString(),
                            environment: process.env.NODE_ENV
                        } as Prisma.InputJsonValue
                    }
                });

                syncResults.synced++;
                syncResults.details.push(`✅ ${item.name} → ${paypalProduct.id}`);

            } catch (itemError) {
                syncResults.errors++;
                const errorMsg = itemError instanceof Error ? itemError.message : 'Unknown error';
                syncResults.details.push(`❌ ${item.name}: ${errorMsg}`);
            }
        }

        return {
            success: true,
            data: syncResults,
            message: `Sync completed: ${syncResults.synced} items synced to PayPal, ${syncResults.skipped} skipped, ${syncResults.errors} errors`
        };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}

// Add function to sync single item to PayPal
export async function syncSingleItemToPayPal(itemId: string, itemName: string, itemPrice: number, itemQuantity: number, imageUrl: string) {
    try {
        // First check if item already has PayPal product ID
        const existingItem = await prisma.item.findUnique({
            where: { id: itemId },
            select: {
                id: true,
                name: true,
                paypal_product_id: true,
                paypal_sync_status: true
            }
        });

        if (!existingItem) {
            throw new Error(`Item ${itemId} not found in database`);
        }

        if (existingItem.paypal_product_id && existingItem.paypal_sync_status === 'SYNCED') {
            return {
                success: true,
                data: {
                    paypal_product_id: existingItem.paypal_product_id,
                    paypal_sync_status: 'SYNCED',
                    message: `Item "${itemName}" is already synced with PayPal`
                }
            };
        }

        const paypal = new PayPalInterface();

        const paypalProduct = await paypal.createItem(
            itemName,
            `Product: ${itemName} - Price: $${itemPrice} - Available: ${itemQuantity}`,
            itemPrice,
            imageUrl
        );

        const updatedItem = await prisma.item.update({
            where: { id: itemId },
            data: {
                paypal_product_id: paypalProduct.id,
                paypal_sync_status: 'SYNCED',
                paypal_last_sync: new Date(),
                paypal_data: {
                    product_id: paypalProduct.id,
                    synced_at: new Date().toISOString(),
                    environment: process.env.NODE_ENV
                } as Prisma.InputJsonValue
            }
        });

        return {
            success: true,
            data: {
                paypal_product_id: paypalProduct.id,
                paypal_sync_status: updatedItem.paypal_sync_status,
                message: `Successfully synced "${itemName}" to PayPal`
            }
        };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

// Add function to import PayPal items to local database
type PayPalItem = {
    id: string;
    name: string;
    image_url?: string;
    // Add other relevant fields as needed
};

export async function importPayPalItems(paypalItems: PayPalItem[]) {
    try {
        console.log(`Importing ${paypalItems.length} PayPal items to local database...`);

        const importResults = {
            created: 0,
            updated: 0,
            skipped: 0,
            errors: 0,
            details: [] as string[]
        };

        for (const paypalItem of paypalItems) {
            try {
                // Check if item already exists in local database
                const existingItem = await prisma.item.findUnique({
                    where: { paypal_product_id: paypalItem.id }
                });

                if (existingItem) {
                    console.log(`Item ${existingItem.id} already exists for PayPal product ID ${paypalItem.id}, skipping...`);
                    importResults.skipped++;
                    importResults.details.push(`⏭️ ${paypalItem.name}: Already exists (ID: ${existingItem.id})`);
                    continue;
                }

                // Create new item in local database
                await prisma.item.create({
                    data: {
                        name: paypalItem.name,
                        img_url: paypalItem.image_url || '/themiracle.png', // Changed from placeholder.png
                        price: 0, // Default price, should be updated manually
                        quantity: 0, // Default quantity, should be updated manually
                        paypal_product_id: paypalItem.id
                    }
                });

                console.log(`✅ Imported PayPal item: ${paypalItem.name}`);
                importResults.created++;

            } catch (error) {
                console.error(`Error importing PayPal item ${paypalItem.name}:`, error);
                importResults.errors++;
                importResults.details.push(`❌ ${paypalItem.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        console.log("Import results:", importResults);

        return {
            success: true,
            data: importResults,
            message: `Import completed: ${importResults.created} created, ${importResults.updated} updated, ${importResults.skipped} skipped, ${importResults.errors} errors`
        };

    } catch (error) {
        console.error("Error importing PayPal items:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}