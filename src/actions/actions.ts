"use server";
import bcrypt from "bcrypt";
import prisma from "../lib/pc";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createSession, encrypt } from '../lib/sessions';
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { logoutUser } from "../lib/sessions";




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
  const session = await encrypt({ email, expiresAt });
  cookies().set(
    'session',
    session,
    {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    }
  )

  try {
    signUpSchema.parse({ name, email, password });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ...prevState, data: error.message };
    }
  }
  try {

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        sessionToken: session
      },
    });
    await prisma.session.create({
      data: {
        userId: user.id,
        ExpiresAt: expiresAt,
        sessionId: session,
      }
    }
    );

    if (!isDev) {
      const check = await fetch("https://themiracle.love/completeSignup.php", {
        method: "POST",
        body: JSON.stringify({ name: name, email: email, verificationToken: user.verificationToken }),
      });
      const data = await check.json();


      if (check.status === 200) {

        return { ...prevState, data: data.message };
      }
    }
    return { ...prevState, data: "User created" };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ...prevState, data: "Email already exists" };
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
  console.log("from getUser", user);
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
  return prisma.item.findMany();
}