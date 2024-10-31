/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import bcrypt from "bcrypt";
import prisma from "../lib/pc";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { encrypt } from '../lib/sessions';
import { cookies } from "next/headers";
type LoginData = {
  data: string | null;
};
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
   const dbSession = await prisma.session.create({
      data: {
        userId: user.id,
        ExpiresAt: expiresAt,
        sessionId: session,
      }
    }
  );
  console.log('dbSession', dbSession)
    const check = await fetch("https://themiracle.love/completeSignup.php", {
      method: "POST",
      body: JSON.stringify({ name: name, email: email, verificationToken: user.verificationToken }),
    });
    const data = await check.json();
   
    console.log(data);
    console.log(check.status);
    if (check.status === 200) {
    
      return { ...prevState, data: data.message  };
    }
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
    return { ...prevState, data: "Invalid email or password" };
  }
  const pasCheck = await bcrypt.compare(password, user!.hashedPassword);
  if (!pasCheck) {
    return { ...prevState, data: "Invalid email or password" };
  }
  if (pasCheck) {
    return { ...prevState, data: user!.name };
  }
  /* 
   const user = await prisma.user.findFirst({
        where: {
            email
        }
    });
    const pasCheck = await bcrypt.compare(password, user!.hashedPassword);
    if(!pasCheck) 
        {throw new Error('Invalid email or password');}
    return user; */
  console.log(email, password);
}
export async function verifyEmail(token: string){
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
    },
  });
  if(!user){
    return {data: "Invalid token"};
  }
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerified: true,
    },
  });
  if(updatedUser.emailVerified){
    return {data: "Email verified"};
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
    console.log(user);
    return { ...prevState, data: "User deleted" };
  }
}
