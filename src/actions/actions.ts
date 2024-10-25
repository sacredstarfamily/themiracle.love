'use server';
import bcrypt from 'bcrypt';
import prisma from '../lib/pc';
import nodemailer from 'nodemailer';

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
    if (user && process.env.NODE_ENV === 'production') {
          const transporter = nodemailer.createTransport({
              host: 'themiracle.love',
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
          transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                  console.log(error);
              } else {
                  console.log('Email sent: ' + info.response);
              }
          });
    }
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