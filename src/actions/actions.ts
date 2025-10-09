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
  try {
    const paypal = new PayPalInterface();

    // Fetch both local items and PayPal items in parallel
    const [localItems, paypalResponse] = await Promise.all([
      prisma.item.findMany(),
      paypal.getItems().catch(error => {
        console.error("Failed to fetch PayPal items:", error);
        return { products: [] }; // Return empty array if PayPal fails
      })
    ]);

    console.log("PayPal items response:", paypalResponse);

    const paypalItems = Array.isArray(paypalResponse.products) ? paypalResponse.products : [];

    // Create a map of PayPal items by ID for easy lookup
    type PayPalProduct = {
      id: string;
      name?: string;
      image_url?: string;
      // Add other relevant fields if needed
      [key: string]: unknown;
    };

    const paypalItemsMap = new Map(
      paypalItems.map((item: PayPalProduct) => [item.id, item])
    );

    // Merge local items with PayPal data
    const mergedItems = localItems.map(localItem => {
      const paypalItem = localItem.paypal_product_id
        ? paypalItemsMap.get(localItem.paypal_product_id)
        : null;

      return {
        ...localItem,
        paypal_data: paypalItem || null,
        // Add PayPal status
        paypal_status: paypalItem ? 'synced' as const : (localItem.paypal_product_id ? 'missing' as const : 'local_only' as const)
      };
    });

    // Find PayPal items that don't exist in local database
    const orphanedPayPalItems = paypalItems
      .filter((paypalItem: PayPalProduct) =>
        !localItems.some(localItem => localItem.paypal_product_id === paypalItem.id)
      )
      .map((paypalItem: PayPalProduct) => ({
        id: `paypal_${paypalItem.id}`,
        name: paypalItem.name || 'Unnamed Product',
        img_url: paypalItem.image_url || '/placeholder.png',
        price: 0, // PayPal catalog doesn't store price in product
        quantity: 0,
        paypal_product_id: paypalItem.id,
        paypal_data: paypalItem,
        paypal_status: 'paypal_only' as const
      }));

    // Combine all items
    const allItems = [...mergedItems, ...orphanedPayPalItems];

    console.log(`Found ${localItems.length} local items, ${paypalItems.length} PayPal items, ${orphanedPayPalItems.length} orphaned PayPal items`);

    return allItems;
  } catch (error) {
    console.error("Error in getAllItems:", error);
    // Fallback to local items only if everything fails
    const localItems = await prisma.item.findMany();
    return localItems.map(item => ({
      ...item,
      paypal_data: null,
      paypal_status: 'local_only' as const
    }));
  }
}

// Add function to sync PayPal catalog with local database
export async function syncPayPalCatalog() {
  try {
    const paypal = new PayPalInterface();
    const paypalResponse = await paypal.getItems();
    const paypalItems = paypalResponse.products || [];

    const syncResults = {
      updated: 0,
      created: 0,
      errors: 0
    };

    for (const paypalItem of paypalItems) {
      try {
        // Check if item exists in local database
        const existingItem = await prisma.item.findFirst({
          where: { paypal_product_id: paypalItem.id }
        });

        if (existingItem) {
          // Update existing item with PayPal data
          await prisma.item.update({
            where: { id: existingItem.id },
            data: {
              name: paypalItem.name,
              img_url: paypalItem.image_url || existingItem.img_url,
              // Don't update price/quantity as PayPal catalog doesn't store these
            }
          });
          syncResults.updated++;
        } else {
          // Create new item from PayPal data
          await prisma.item.create({
            data: {
              name: paypalItem.name,
              img_url: paypalItem.image_url || '/placeholder.png',
              price: 0, // Default price, should be updated manually
              quantity: 0, // Default quantity, should be updated manually
              paypal_product_id: paypalItem.id
            }
          });
          syncResults.created++;
        }
      } catch (itemError) {
        console.error(`Error syncing PayPal item ${paypalItem.id}:`, itemError);
        syncResults.errors++;
      }
    }

    return syncResults;
  } catch (error) {
    console.error("Error syncing PayPal catalog:", error);
    throw new Error("Failed to sync PayPal catalog");
  }
}