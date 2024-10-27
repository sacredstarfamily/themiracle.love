/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import bcrypt from 'bcrypt';
import prisma from '../lib/pc';

import { Prisma } from '@prisma/client';

type LoginData = {
    data: string | null
}


export async function createUser(prevState: LoginData | undefined, formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
     await prisma.user.create({
        data: {
            name,
            email,
            hashedPassword
        }
    });

    const check = await fetch('https://themiracle.love/completeSignup.php', {
        method: 'POST',
        body: JSON.stringify({"name": name, "email": email}),
    })
    const data = await check.json();
    console.log(data);
    console.log(check.status);
    if(check.status === 200){
    return {...prevState, data: data.message}
    }
} catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          return {...prevState, data: "Email already exists"}
    }
}

    
}

export async function loginUser(prevState: LoginData | undefined, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const user = await prisma.user.findFirst({
        where: {
            email
        }
    });
    if (!user) {
        return {...prevState, data: "Invalid email or password"}
    }
    const pasCheck = await bcrypt.compare(password, user!.hashedPassword);
    if(!pasCheck)
    {
        return {...prevState, data: "Invalid email or password"}
    }
    if(pasCheck)
    {
        return {...prevState, data: user!.name}
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
export async function deleteUserData(prevState: LoginData | undefined, formData: FormData) {
    const user = await prisma.user.deleteMany(
        {
            where: {
                email: formData.get('email') as string
            }
        }
    );
  if(user){
    console.log(user);
      return {...prevState, data: "User deleted"}
  }
}