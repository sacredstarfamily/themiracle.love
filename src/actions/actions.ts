"use server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { z } from "zod";
import prisma from "../lib/pc";
import { createSession, logoutUser } from '../lib/sessions';
import { PayPalInterface } from "./paypalActions";




type LoginData = {
  data: string | null;
};
const isDev = process.env.NODE_ENV === "development";
const signUpSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(3).max(255),
});

export async function createUser(
  prevState: LoginData | undefined,
  formData: FormData,
) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const hashedPassword = await bcrypt.hash(password, 10);
  const expiresAt: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const y = await createSession(email);


  try {
    signUpSchema.parse({ name, email, password });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ...prevState, data: "fail" };
    }
  }
  try {

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        sessionToken: y
      },
    });
    await prisma.session.create({
      data: {
        userId: user.id,
        ExpiresAt: expiresAt,
        sessionId: y,
      }
    }
    );

    if (!isDev) {
      const check = await fetch("https://themiracle.love/completeSignup.php", {
        method: "POST",
        body: JSON.stringify({ name: name, email: email, verificationToken: user.verificationToken }),
      });
      const data = await check.json();
      console.log(data)

      if (check.status === 200) {

        return { ...prevState, data: y };
      }
    }
    return { ...prevState, data: y };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ...prevState, data: "fail" };
    }
  }
}


export async function loginUser(
  prevState: LoginData | undefined,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });
  if (!user) {
    return { ...prevState, data: "fail" };
  }
  const pasCheck = await bcrypt.compare(password, user!.hashedPassword);
  if (!pasCheck) {
    return { ...prevState, data: "fail" };
  }
  if (pasCheck) {
    console.log(user)
    const y = await createSession(email);
    console.log(prevState)
    return { ...prevState, data: y };

  }

}
export async function getUser(sessionToken: string) {
  const user = await prisma.user.findFirst({
    where: {
      sessionToken,
    },
    select: {
      id: true,
      name: true,
      email: true,
      sessionToken: true,
    },
  });
  if (!user) {
    return "fail";
  }
  return user;
}

export async function addUserWallet(userId: string, publicKey: string, chain: string) {
  const json = [
    {
      "publicKey": publicKey,
      "chain": chain
    }
  ]
  const updated = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      wallets: json
    }
  });
  if (updated) {
    return { data: "Wallet added" };
  }
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
    },
  });
  if (!user) {
    return { data: "Invalid token" };
  }
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerified: true,
    },
  });
  if (updatedUser.emailVerified) {
    return { data: "Email verified" };
  }
}
export async function checkLink(link: string) {
  console.log('checking link', link);
  const user = await prisma.user.findFirst({
    where: {
      passwordResetLink: link,
    },
  });
  if (!user) {
    return false;
  }
  return true;
}


export async function requestPasswordUpdate(
  prevState: LoginData | undefined,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });
  if (!user) {
    return { ...prevState, data: "Invalid email" };
  }
  const token = Math.floor(100000 + Math.random() * 900000);
  const resetExpiration = new Date(Date.now() + (7 * 60 * 60 * 1000));
  const resetLink = randomUUID();
  const link = await prisma.user.updateMany({
    where: {
      email,
    },
    data: {
      passwordResetLink: resetLink,
      passwordResetToken: token,
      passwordResetExpiry: resetExpiration
    },
  });
  if (!link) {

  }
  if (!isDev) {
    await fetch("https://themiracle.love/resetPassword.php", {
      method: "POST",
      body: JSON.stringify({ email: email, link: resetLink, token: token }),
    });
  }

  if (isDev) {
    console.log('resetLink', resetLink);
    console.log('token', token);
  }

  return { ...prevState, data: "Password reset link sent" };
}
export async function updateUserPassword(
  prevState: LoginData | undefined,
  formData: FormData) {
  const link = formData.get("link") as string;
  const resetToken = Number(formData.get("resettoken"));
  const password = formData.get("password") as string;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.findFirst({
    where: {
      passwordResetLink: link
    }
  });
  if (resetToken !== user?.passwordResetToken) {
    return { ...prevState, data: "Invalid token" };
  }
  const updateduser = await prisma.user.updateMany({
    where: {
      passwordResetLink: link,
    },
    data: {
      hashedPassword: hashedPassword,
      passwordResetLink: null,
      passwordResetToken: null,
      passwordResetExpiry: null,
    },
  });
  if (updateduser) {
    return { ...prevState, data: "Password updated" };
  }
}


export async function deleteUserData(
  prevState: LoginData | undefined,
  formData: FormData,
) {
  const user = await prisma.user.deleteMany({
    where: {
      email: formData.get("email") as string,
    },
  });
  if (user) {

    return { ...prevState, data: "User deleted" };
  }
}
export async function logoutUserAction() {
  await logoutUser();

}

//Items functions
export async function getAllItems() {
  console.log("=== GET ALL ITEMS PROCESS STARTED ===");

  try {
    const paypal = new PayPalInterface();

    console.log("Fetching local items and PayPal items...");

    // Fetch both local items and PayPal items in parallel
    const [localItems, paypalResponse] = await Promise.all([
      prisma.item.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          img_url: true,
          price: true,
          quantity: true,
          paypal_product_id: true,
          orderId: true,
          paypal_sync_status: true,
          paypal_data: true,
          paypal_last_sync: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      paypal.getItems().catch(error => {
        console.error("PayPal fetch failed:", error);
        return { products: [] };
      })
    ]);

    console.log(`Found ${localItems.length} local items`);
    console.log("Sample local items sync status:", localItems.slice(0, 3).map(i => ({
      name: i.name,
      paypal_sync_status: i.paypal_sync_status,
      paypal_product_id: i.paypal_product_id
    })));

    const paypalItems = Array.isArray(paypalResponse.products) ? paypalResponse.products : [];
    console.log(`Found ${paypalItems.length} PayPal items`);

    type PayPalProduct = {
      id: string;
      name?: string;
      image_url?: string;
      [key: string]: unknown;
    };

    const paypalItemsMap = new Map(
      paypalItems.map((item: PayPalProduct) => [item.id, item])
    );

    // FIXED: Properly respect database sync status
    const mergedItems = localItems.map(localItem => {
      console.log(`Processing: ${localItem.name}`, {
        db_status: localItem.paypal_sync_status,
        paypal_id: localItem.paypal_product_id,
        in_paypal_response: localItem.paypal_product_id ? paypalItemsMap.has(localItem.paypal_product_id) : false
      });

      let paypal_status: 'synced' | 'missing' | 'local_only' | 'paypal_only';

      // Use database sync status as the primary source of truth
      if (localItem.paypal_sync_status === 'LOCAL_ONLY') {
        paypal_status = 'local_only';
        console.log(`✅ ${localItem.name}: DB says LOCAL_ONLY → local_only`);
      } else if (localItem.paypal_sync_status === 'SYNCED') {
        paypal_status = 'synced';
        console.log(`✅ ${localItem.name}: DB says SYNCED → synced`);
      } else if (localItem.paypal_sync_status === 'PAYPAL_ONLY') {
        paypal_status = 'paypal_only';
        console.log(`✅ ${localItem.name}: DB says PAYPAL_ONLY → paypal_only`);
      } else if (localItem.paypal_sync_status === 'MISSING') {
        paypal_status = 'missing';
        console.log(`✅ ${localItem.name}: DB says MISSING → missing`);
      } else {
        // Legacy items without proper sync status - determine based on PayPal ID
        if (!localItem.paypal_product_id) {
          paypal_status = 'local_only';
          console.log(`🔄 ${localItem.name}: No sync status + no PayPal ID → local_only`);

          // Update DB to reflect this
          prisma.item.update({
            where: { id: localItem.id },
            data: { paypal_sync_status: 'LOCAL_ONLY' }
          }).catch(err => console.warn(`Failed to update ${localItem.id}:`, err));
        } else {
          // Has PayPal ID but no sync status - check if it exists in PayPal
          const existsInPayPal = paypalItemsMap.has(localItem.paypal_product_id);
          paypal_status = existsInPayPal ? 'synced' : 'missing';
          console.log(`🔄 ${localItem.name}: No sync status + has PayPal ID + exists=${existsInPayPal} → ${paypal_status}`);

          // Update DB to reflect this
          prisma.item.update({
            where: { id: localItem.id },
            data: {
              paypal_sync_status: existsInPayPal ? 'SYNCED' : 'MISSING',
              paypal_last_sync: new Date()
            }
          }).catch(err => console.warn(`Failed to update ${localItem.id}:`, err));
        }
      }

      return {
        ...localItem,
        paypal_data: localItem.paypal_product_id ? paypalItemsMap.get(localItem.paypal_product_id) || null : null,
        paypal_status
      };
    });

    // Find PayPal items that don't exist in local database (orphaned)
    const orphanedPayPalItems = paypalItems
      .filter((paypalItem: PayPalProduct) => {
        const isOrphaned = !localItems.some(localItem => localItem.paypal_product_id === paypalItem.id);
        if (isOrphaned) {
          console.log(`🔍 Orphaned PayPal item: ${paypalItem.name} (${paypalItem.id})`);
        }
        return isOrphaned;
      })
      .map((paypalItem: PayPalProduct) => ({
        id: `paypal_${paypalItem.id}`,
        name: paypalItem.name || 'Unnamed Product',
        img_url: paypalItem.image_url || '/placeholder.png',
        price: 0,
        quantity: 0,
        paypal_product_id: paypalItem.id,
        paypal_sync_status: 'PAYPAL_ONLY' as const,
        paypal_data: paypalItem,
        paypal_status: 'paypal_only' as const
      }));

    // Combine all items
    const allItems = [...mergedItems, ...orphanedPayPalItems];

    const finalCounts = {
      local: localItems.length,
      paypal: paypalItems.length,
      orphaned: orphanedPayPalItems.length,
      total: allItems.length,
      synced: allItems.filter(i => i.paypal_status === 'synced').length,
      local_only: allItems.filter(i => i.paypal_status === 'local_only').length,
      paypal_only: allItems.filter(i => i.paypal_status === 'paypal_only').length,
      missing: allItems.filter(i => i.paypal_status === 'missing').length
    };

    console.log("📊 Final item counts:", finalCounts);
    console.log("🔍 Status verification:");
    console.log("- SYNCED items:", allItems.filter(i => i.paypal_status === 'synced').map(i => i.name));
    console.log("- LOCAL_ONLY items:", allItems.filter(i => i.paypal_status === 'local_only').map(i => i.name));
    console.log("- PAYPAL_ONLY items:", allItems.filter(i => i.paypal_status === 'paypal_only').map(i => i.name));
    console.log("- MISSING items:", allItems.filter(i => i.paypal_status === 'missing').map(i => i.name));

    console.log("=== GET ALL ITEMS PROCESS COMPLETED ===");
    return allItems;
  } catch (error) {
    console.error("Error in getAllItems:", error);
    console.log("Falling back to local items only...");

    const localItems = await prisma.item.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const fallbackItems = localItems.map(item => ({
      ...item,
      paypal_data: null,
      paypal_status: item.paypal_sync_status === 'LOCAL_ONLY' ? 'local_only' as const :
        item.paypal_sync_status === 'SYNCED' ? 'synced' as const :
          item.paypal_product_id ? 'missing' as const : 'local_only' as const
    }));

    console.log(`Fallback: returning ${fallbackItems.length} local items`);
    return fallbackItems;
  }
}

// Add function to sync PayPal catalog with local database
export async function syncPayPalCatalog() {
  console.log("=== SYNC PAYPAL CATALOG PROCESS STARTED ===");

  try {
    const paypal = new PayPalInterface();
    console.log("Fetching PayPal items for sync...");

    const paypalResponse = await paypal.getItems();
    const paypalItems = paypalResponse.products || [];

    console.log(`Found ${paypalItems.length} PayPal items to sync`);

    const syncResults = {
      updated: 0,
      created: 0,
      errors: 0
    };

    for (const paypalItem of paypalItems) {
      console.log(`Processing PayPal item: ${paypalItem.name} (${paypalItem.id})`);

      try {
        const existingItem = await prisma.item.findFirst({
          where: { paypal_product_id: paypalItem.id }
        });

        if (existingItem) {
          console.log(`Updating existing item: ${existingItem.name}`);

          await prisma.item.update({
            where: { id: existingItem.id },
            data: {
              name: paypalItem.name,
              img_url: paypalItem.image_url || existingItem.img_url,
              paypal_sync_status: 'SYNCED', // Ensure sync status is correct
              paypal_data: paypalItem as Prisma.InputJsonValue,
              paypal_last_sync: new Date(),
            }
          });
          syncResults.updated++;
        } else {
          console.log(`Creating new item from PayPal: ${paypalItem.name}`);

          await prisma.item.create({
            data: {
              name: paypalItem.name,
              img_url: paypalItem.image_url || '/placeholder.png',
              price: 0,
              quantity: 0,
              paypal_product_id: paypalItem.id,
              paypal_sync_status: 'PAYPAL_ONLY', // Set correct status for PayPal-only items
              paypal_data: paypalItem as Prisma.InputJsonValue,
              paypal_last_sync: new Date(),
              description: paypalItem.description || `PayPal product: ${paypalItem.name}`,
              is_active: true,
              is_digital: true,
              slug: paypalItem.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `paypal-${paypalItem.id}`,
            }
          });
          syncResults.created++;
        }
      } catch (itemError) {
        console.error(`Error syncing PayPal item ${paypalItem.id}:`, itemError);
        syncResults.errors++;
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
          sync_status: 'SYNCED',
          catalog_metadata: { total_items: paypalItems.length, environment: process.env.NODE_ENV } as Prisma.InputJsonValue
        },
        update: {
          total_products: paypalItems.length,
          last_sync: new Date(),
          sync_status: syncResults.errors > 0 ? 'ERROR' : 'SYNCED',
          catalog_metadata: { total_items: paypalItems.length, environment: process.env.NODE_ENV } as Prisma.InputJsonValue
        }
      });
    } catch (catalogError) {
      console.warn("PayPal catalog tracking not available - run 'npx prisma db push && npx prisma generate'");
    }

    console.log("Sync completed with results:", syncResults);
    return syncResults;
  } catch (error) {
    console.error("Error syncing PayPal catalog:", error);
    throw new Error("Failed to sync PayPal catalog");
  }
}