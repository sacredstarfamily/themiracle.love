import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { SessionPayload } from './definitions';
import { cookies } from 'next/headers';
import prisma from './pc';



const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
 
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}
 

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    console.log('Failed to verify session')
  }
}

export async function createSession(email: string) {
  const expiresAt: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ email, expiresAt });
  console.log('session', session)
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
 const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });
  
  if(user){
    console.log('user', user.id)
    console.log('session', session)
    console.log('expiresAt', expiresAt)
    await prisma.session.create({
      data: {
        userId: user.id,
        ExpiresAt: expiresAt,
        sessionId: session,
      }
    }
  );
  }
  return session
}