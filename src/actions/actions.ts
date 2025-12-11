"use server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import bcrypt from "bcryptjs";
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
  console.log("createUser called with formData:", { name: formData.get("name"), email: formData.get("email") });
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  console.log("Extracted data:", { name, email, passwordLength: password.length });
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Password hashed successfully");
  const expiresAt: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const y = await createSession(email);
  console.log("Session created:", y);


  try {
    signUpSchema.parse({ name, email, password });
    console.log("Zod validation passed");
  } catch (error) {
    console.log("Zod validation failed:", error);
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
    console.log("User created in DB:", user.id);
    await prisma.session.create({
      data: {
        userId: user.id,
        ExpiresAt: expiresAt,
        sessionId: y,
      }
    }
    );
    console.log("Session created in DB");

    if (!isDev) {
      console.log("Not dev, fetching completeSignup");
      const check = await fetch("https://themiracle.love/completeSignup.php", {
        method: "POST",
        body: JSON.stringify({ name: name, email: email, verificationToken: user.verificationToken }),
      });
      const data = await check.json();
      console.log("completeSignup response:", data, "status:", check.status);

      if (check.status === 200) {

        return { ...prevState, data: y };
      }
    }
    return { ...prevState, data: y };
  } catch (error) {
    console.log("Error in createUser:", error);
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ...prevState, data: "User with this email already exists" };
    }
    // For debugging, return error message
    return { ...prevState, data: `Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
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
export async function getDbItems() {
  try {
    const items = await prisma.item.findMany({
    });
    return items;
  } catch (error) {
    console.error("Error in getDbItems:", error);
    return [];
  }
}

export async function getAllItems() {
  try {
    console.log('🔄 Starting getAllItems function...');

    // First, try to get local items from database
    const localItems = await prisma.item.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });


    console.log(`📊 Found ${localItems.length} local items in database`);

    // Return early with just local items to avoid PayPal fetch issues
    const mappedItems = localItems.map(item => ({
      ...item,
      paypal_data: item.paypal_data || null,
      paypal_status: item.paypal_sync_status === 'LOCAL_ONLY' ? 'local_only' as const :
        item.paypal_sync_status === 'SYNCED' ? 'synced' as const :
          item.paypal_product_id ? 'missing' as const : 'local_only' as const
    }));

    console.log(`✅ Returning ${mappedItems.length} items (simplified query)`);
    return mappedItems;

  } catch (error) {
    console.error("Error in getAllItems:", error);
    // Return empty array if query fails
    return [];
  }
}

// Add function to sync PayPal catalog with local database
export async function syncPayPalCatalog() {
  try {
    console.log('🔄 Starting PayPal catalog sync...');
    const paypal = new PayPalInterface();
    const paypalResponse = await paypal.getItems();
    const paypalItems = paypalResponse.products || [];

    console.log(`📊 Found ${paypalItems.length} items in PayPal catalog for sync`);

    const syncResults = {
      updated: 0,
      created: 0,
      errors: 0
    };

    for (const paypalItem of paypalItems) {
      try {
        const existingItem = await prisma.item.findFirst({
          where: { paypal_product_id: paypalItem.id }
        });

        if (existingItem) {
          await prisma.item.update({
            where: { id: existingItem.id },
            data: {
              name: paypalItem.name,
              img_url: paypalItem.image_url || existingItem.img_url,
              paypal_sync_status: 'SYNCED',
              paypal_data: paypalItem as any,
              paypal_last_sync: new Date(),
            }
          });
          syncResults.updated++;
        } else {
          await prisma.item.create({
            data: {
              name: paypalItem.name,
              img_url: paypalItem.image_url || '/placeholder.png',
              price: 0,
              quantity: 0,
              paypal_product_id: paypalItem.id,
              paypal_sync_status: 'PAYPAL_ONLY',
              paypal_data: paypalItem as any,
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
          catalog_metadata: { total_items: paypalItems.length, environment: process.env.NODE_ENV } as any
        },
        update: {
          total_products: paypalItems.length,
          last_sync: new Date(),
          sync_status: syncResults.errors > 0 ? 'ERROR' : 'SYNCED',
          catalog_metadata: { total_items: paypalItems.length, environment: process.env.NODE_ENV } as any
        }
      });
    } catch (catalogError) {
      // Silent fail for catalog tracking
    }

    console.log(`✅ PayPal catalog sync completed: ${syncResults.created} created, ${syncResults.updated} updated, ${syncResults.errors} errors`);

    return syncResults;
  } catch (error) {
    console.error("Error syncing PayPal catalog:", error);
    throw new Error("Failed to sync PayPal catalog");
  }
}