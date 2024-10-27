/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import bcrypt from 'bcrypt';
import prisma from '../lib/pc';
import nodemailer from 'nodemailer';

type LoginData = {
    data: string | null
}


export async function createUser(prevState: LoginData | undefined, formData: FormData) {
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
    if (user && process.env.NODE_ENV === 'production') {
          const transporter = nodemailer.createTransport({
              host: 'smtp.themiracle.love',
              port: 465,
              secure: false,
              auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS
              }
          });
          const mailOptions = {
              from: process.env.EMAIL_USER,
              to: email,
              subject: 'Registration Confirmation',
              text: 'Thank you for registering!'
          };
          let trasporterReady;
        transporter.verify(function(error, success) {
              if (error) {
                  transporterReady = false
              } else if(success){
                  trasporterReady = true
              }
          });
          if (trasporterReady) {
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    return {...prevState, data: error.message}
                } else {
                   return {...prevState, data: 'Email sent: ' + info.response}
                }
            });
          }
          
          return {...prevState, data: user.name}
    }
    if (user) {
        return {...prevState, data: user.name}
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