"use server";

import prisma from "../lib/pc";

import fs, { writeFile } from "fs";
import { PayPalInterface } from "./paypalActions";

import { PayPalSyncStatus, Prisma } from "@prisma/client";
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

    // Extract form data with all new fields
    const item_name = formData.get("item_name") as string;
    const price = Number(formData.get("item_price"));
    const quantity = Number(formData.get("item_quantity"));
    const description = formData.get("item_description") as string;
    const paypal_type = formData.get("paypal_type") as string;
    const paypal_category = formData.get("paypal_category") as string;
    const paypal_home_url = formData.get("paypal_home_url") as string;

    // Validate form data
    if (!item_name || item_name.trim().length === 0) {
        return { ...prevState, data: 'Item name is required' };
    }

    if (item_name.length > 127) {
        return { ...prevState, data: 'Item name must be 127 characters or less' };
    }

    if (!description || description.trim().length === 0) {
        return { ...prevState, data: 'Description is required' };
    }

    if (description.length > 256) {
        return { ...prevState, data: 'Description must be 256 characters or less' };
    }

    if (isNaN(price) || price <= 0) {
        return { ...prevState, data: 'Valid price greater than 0 is required' };
    }

    if (isNaN(quantity) || quantity < 0) {
        return { ...prevState, data: 'Valid quantity (0 or greater) is required' };
    }

    if (paypal_home_url && !paypal_home_url.startsWith('https://')) {
        return { ...prevState, data: 'Home URL must use HTTPS protocol' };
    }

    if (formData.get("item_image")) {
        const iurl = await uploadImage(formData);
        if (!iurl) {
            return { ...prevState, data: 'Image upload failed' };
        }

        let paypalProductId: string | null = null;
        let paypalCreationResult = "";
        let paypalVerified = false;
        const isDevelopment = process.env.NODE_ENV === 'development';

        // Try PayPal creation with verification
        try {
            console.log("Attempting PayPal product creation...");
            console.log("PayPal creation data:", {
                name: item_name,
                description: description,
                price: price,
                type: paypal_type,
                category: paypal_category,
                home_url: paypal_home_url || "https://themiracle.love"
            });

            const paypal = new PayPalInterface();

            const imageUrl = isDevelopment
                ? "https://via.placeholder.com/400x400.png?text=Product+Image"
                : `https://themiracle.love${iurl.img_url.replace('/public', '')}`;

            // Validate and clean the data before sending to PayPal
            const cleanName = item_name.trim();
            const cleanDescription = description.trim();
            const cleanHomeUrl = (paypal_home_url && paypal_home_url.trim()) || "https://themiracle.love";

            // Ensure URLs are valid
            if (!imageUrl.startsWith('https://')) {
                throw new Error('Image URL must use HTTPS protocol');
            }

            if (!cleanHomeUrl.startsWith('https://')) {
                throw new Error('Home URL must use HTTPS protocol');
            }

            // Validate PayPal product type
            const validTypes = ['PHYSICAL', 'DIGITAL', 'SERVICE'];
            if (!validTypes.includes(paypal_type)) {
                throw new Error(`Invalid product type: ${paypal_type}. Must be one of: ${validTypes.join(', ')}`);
            }

            // Validate PayPal category
            const validCategories = [
                'SOFTWARE',
                'DIGITAL_MEDIA_BOOKS_MOVIES_MUSIC', // Updated from DIGITAL_GOODS
                'BOOKS_PERIODICALS_AND_NEWSPAPERS',
                'ENTERTAINMENT',
                'MUSIC',
                'GAMES',
                'EDUCATION_AND_TEXTBOOKS',
                'ART_AND_CRAFTS',
                'COLLECTIBLES',
                'CLOTHING_SHOES_AND_ACCESSORIES',
                'ELECTRONICS_AND_COMPUTERS',
                'TOYS_AND_HOBBIES',
                'OTHER'
            ];
            if (!validCategories.includes(paypal_category)) {
                throw new Error(`Invalid category: ${paypal_category}. Must be one of: ${validCategories.join(', ')}`);
            }

            console.log("Creating PayPal product with validated data:", {
                name: cleanName,
                description: cleanDescription,
                price: price,
                imageUrl: imageUrl,
                type: paypal_type,
                category: paypal_category,
                homeUrl: cleanHomeUrl
            });

            const paypalProduct = await paypal.createItem(
                cleanName,
                cleanDescription,
                price,
                imageUrl,
                paypal_type,
                paypal_category,
                cleanHomeUrl
            );

            paypalProductId = paypalProduct.id;
            console.log("✅ PayPal product created with ID:", paypalProductId);

            // Verify the product was actually created by fetching it back
            try {
                console.log("🔍 Verifying PayPal product creation...");

                // Check if paypalProductId is not null before using it
                if (!paypalProductId) {
                    throw new Error("PayPal product ID is null");
                }

                const verificationProduct = await paypal.getProduct(paypalProductId);

                if (verificationProduct && verificationProduct.id === paypalProductId) {
                    console.log("✅ PayPal product verification successful");
                    paypalVerified = true;
                    paypalCreationResult = `PayPal ${isDevelopment ? 'sandbox' : 'live'} product created and verified`;
                } else {
                    console.warn("⚠️ PayPal product verification failed - product not found after creation");
                    paypalProductId = null;
                    paypalCreationResult = "PayPal product creation could not be verified";
                }
            } catch (verificationError) {
                console.error("❌ PayPal product verification failed:", verificationError);
                // Try to clean up the potentially created but unverifiable product
                if (paypalProductId) {
                    try {
                        await paypal.deleteProduct(paypalProductId);
                        console.log("🧹 Cleaned up unverifiable PayPal product");
                    } catch (cleanupError) {
                        console.error("Failed to cleanup unverifiable product:", cleanupError);
                    }
                }

                paypalProductId = null;
                paypalVerified = false;
                paypalCreationResult = "PayPal product creation verification failed";
            }

        } catch (paypalError) {
            console.error("❌ PayPal product creation failed:", paypalError);

            // Provide more specific error message
            let errorMessage = paypalError instanceof Error ? paypalError.message : 'Unknown error';

            // Check for common PayPal API issues
            if (errorMessage.includes('syntactically incorrect') || errorMessage.includes('schema')) {
                errorMessage += '\n\nPossible issues:\n- Invalid characters in name or description\n- Missing required fields\n- Invalid URL format\n- Category/Type mismatch';
            }

            paypalCreationResult = `PayPal catalog creation failed: ${errorMessage}`;
            paypalProductId = null;
            paypalVerified = false;
        }

        try {
            console.log("Creating item in database...");

            const itemData = {
                name: item_name,
                price,
                img_url: iurl.img_url,
                quantity,
                description,
                paypal_product_id: paypalVerified ? paypalProductId : null,
                paypal_sync_status: paypalVerified ? PayPalSyncStatus.SYNCED : PayPalSyncStatus.LOCAL_ONLY,
                paypal_data: paypalVerified && paypalProductId ? {
                    product_id: paypalProductId,
                    synced_at: new Date().toISOString(),
                    environment: process.env.NODE_ENV,
                    verified: true,
                    type: paypal_type,
                    category: paypal_category,
                    home_url: paypal_home_url || "https://themiracle.love"
                } : Prisma.JsonNull,
                paypal_last_sync: paypalVerified ? new Date() : null,
                is_active: true,
                is_digital: paypal_type === 'DIGITAL',
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
                quantity: addedItem.quantity,
                paypal_sync_status: addedItem.paypal_sync_status,
                paypal_product_id: addedItem.paypal_product_id,
                paypal_verified: paypalVerified
            });

            // Enhanced success message with verification status
            let message: string;
            if (paypalVerified && paypalProductId) {
                message = `✅ "${item_name}" created successfully!\n• Database: ✅ Created with ${quantity} inventory\n• PayPal: ✅ ${paypalCreationResult}\n• Verification: ✅ Confirmed\n• Status: SYNCED\n• Type: ${paypal_type}\n• Category: ${paypal_category}`;
            } else if (paypalProductId && !paypalVerified) {
                message = `⚠️ "${item_name}" created with verification issues.\n• Database: ✅ Created with ${quantity} inventory\n• PayPal: ⚠️ Created but not verified\n• Status: LOCAL_ONLY (for safety)\n\nYou can sync this item later from the admin panel.`;
            } else {
                message = `⚠️ "${item_name}" added to database only.\n• Database: ✅ Created with ${quantity} inventory\n• PayPal: ❌ ${paypalCreationResult}\n• Status: LOCAL_ONLY\n\nYou can sync this item to PayPal later from the admin panel.`;
            }

            return { ...prevState, data: message };

        } catch (error) {
            console.error("❌ Database creation failed:", error);

            // Cleanup PayPal if DB creation failed and product was verified
            if (paypalVerified && paypalProductId) {
                try {
                    const paypal = new PayPalInterface();
                    await paypal.deleteProduct(paypalProductId);
                    console.log("🧹 Cleaned up PayPal product due to database failure");
                } catch (cleanupError) {
                    console.error("Failed to cleanup PayPal product:", cleanupError);
                }
            }

            return { ...prevState, data: 'Failed to create item in database' };
        }
    }

    return { ...prevState, data: 'No image provided' };
}

// New function to update local database from PayPal item
export async function updateLocalFromPayPal(paypalItem: {
    id: string;
    name: string;
    description?: string;
    type?: string;
    category?: string;
    image_url?: string;
    home_url?: string;
    create_time?: string;
    update_time?: string;
    [key: string]: unknown;
}) {
    try {
        console.log(`🔄 Updating local item from PayPal: ${paypalItem.name}`);

        const existingItem = await prisma.item.findFirst({
            where: { paypal_product_id: paypalItem.id }
        });

        if (existingItem) {
            // Update existing item
            const updatedItem = await prisma.item.update({
                where: { id: existingItem.id },
                data: {
                    name: paypalItem.name,
                    description: paypalItem.description || existingItem.description,
                    img_url: paypalItem.image_url || existingItem.img_url,
                    paypal_sync_status: PayPalSyncStatus.SYNCED,
                    paypal_data: {
                        product_id: paypalItem.id,
                        synced_at: new Date().toISOString(),
                        environment: process.env.NODE_ENV,
                        verified: true,
                        type: paypalItem.type,
                        category: paypalItem.category,
                        home_url: paypalItem.home_url,
                        last_updated: paypalItem.update_time
                    } as Prisma.InputJsonValue,
                    paypal_last_sync: new Date(),
                }
            });

            console.log(`✅ Updated local item: ${updatedItem.name}`);
            return { success: true, action: 'updated', item: updatedItem };
        } else {
            // Create new item from PayPal data
            const newItem = await prisma.item.create({
                data: {
                    name: paypalItem.name,
                    description: paypalItem.description || `PayPal product: ${paypalItem.name}`,
                    price: 0, // PayPal catalog doesn't store prices the same way
                    quantity: 0, // Default quantity for PayPal-only items
                    img_url: paypalItem.image_url || '/placeholder.png',
                    paypal_product_id: paypalItem.id,
                    paypal_sync_status: PayPalSyncStatus.PAYPAL_ONLY,
                    paypal_data: {
                        product_id: paypalItem.id,
                        synced_at: new Date().toISOString(),
                        environment: process.env.NODE_ENV,
                        verified: true,
                        type: paypalItem.type,
                        category: paypalItem.category,
                        home_url: paypalItem.home_url,
                        created_time: paypalItem.create_time,
                        last_updated: paypalItem.update_time
                    } as Prisma.InputJsonValue,
                    paypal_last_sync: new Date(),
                    is_active: true,
                    is_digital: paypalItem.type === 'DIGITAL',
                    inventory_tracked: false, // PayPal-only items don't track inventory locally
                    slug: paypalItem.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `paypal-${paypalItem.id}`,
                }
            });

            console.log(`✅ Created new local item from PayPal: ${newItem.name}`);
            return { success: true, action: 'created', item: newItem };
        }
    } catch (error) {
        console.error(`❌ Failed to update local item from PayPal:`, error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// Enhanced sync PayPal catalog action with local database updates
export async function syncPayPalCatalogAction() {
    try {
        console.log('🔄 Starting enhanced PayPal catalog sync...');

        const paypal = new PayPalInterface();
        const paypalResponse = await paypal.getItems();
        const paypalItems = paypalResponse.products || [];

        console.log(`📊 Found ${paypalItems.length} items in PayPal catalog`);

        const syncResults = {
            updated: 0,
            created: 0,
            errors: 0,
            details: [] as string[]
        };

        for (const paypalItem of paypalItems) {
            try {
                const result = await updateLocalFromPayPal(paypalItem);

                if (result.success) {
                    if (result.action === 'updated') {
                        syncResults.updated++;
                        syncResults.details.push(`Updated: ${result.item?.name}`);
                    } else if (result.action === 'created') {
                        syncResults.created++;
                        syncResults.details.push(`Created: ${result.item?.name}`);
                    }
                } else {
                    syncResults.errors++;
                    syncResults.details.push(`Error with ${paypalItem.name}: ${result.error}`);
                }
            } catch (itemError) {
                syncResults.errors++;
                syncResults.details.push(`Error processing ${paypalItem.name}: ${itemError}`);
                console.error(`Error processing PayPal item ${paypalItem.id}:`, itemError);
            }
        }

        // Update PayPal catalog tracking
        try {
            await prisma.payPalCatalog.upsert({
                where: { id: 'main' },
                create: {
                    id: 'main',
                    total_products: paypalItems.length,
                    last_sync: new Date(),
                    sync_status: syncResults.errors > 0 ? 'ERROR' : 'SYNCED',
                    catalog_metadata: {
                        total_items: paypalItems.length,
                        environment: process.env.NODE_ENV,
                        last_full_sync: new Date().toISOString(),
                        sync_results: syncResults
                    } as Prisma.InputJsonValue
                },
                update: {
                    total_products: paypalItems.length,
                    last_sync: new Date(),
                    sync_status: syncResults.errors > 0 ? 'ERROR' : 'SYNCED',
                    catalog_metadata: {
                        total_items: paypalItems.length,
                        environment: process.env.NODE_ENV,
                        last_full_sync: new Date().toISOString(),
                        sync_results: syncResults
                    } as Prisma.InputJsonValue
                }
            });
        } catch (catalogError) {
            console.error('Failed to update catalog tracking:', catalogError);
        }

        const message = `PayPal → Local sync completed!\n\n✅ Updated: ${syncResults.updated} items\n✅ Created: ${syncResults.created} items\n${syncResults.errors > 0 ? `❌ Errors: ${syncResults.errors} items\n` : ''}📊 Total PayPal items: ${paypalItems.length}`;

        console.log(`✅ PayPal catalog sync completed:`, syncResults);

        return {
            success: true,
            message,
            data: {
                ...syncResults,
                totalItems: paypalItems.length
            }
        };
    } catch (error) {
        console.error("Error syncing PayPal catalog:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
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