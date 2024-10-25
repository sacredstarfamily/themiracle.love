'use server';
import bcrypt from 'bcrypt';
import prisma from '../lib/pc';

export async function createUser(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            hashedPassword
        }
    });
    console.log(user, name, email, hashedPassword);
}

export async function loginUser(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const user = await prisma.user.findFirst({
        where: {
            email
        }
    });
    if (!user) {
        console.log('no user');
    }
    const pasCheck = await bcrypt.compare(password, user!.hashedPassword);
    if(!pasCheck)
    {
        console.log('no user');
    }
    if(pasCheck)
    {
        console.log('user found');
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