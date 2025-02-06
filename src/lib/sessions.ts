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
    return null
  }
}

export async function createSession(email: string) {
  const expiresAt: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ email, expiresAt })
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
  const sesh = session.slice(0, 60);

  if (user) {

    try {
      await prisma.user.update({
        where: {
          email: email
        },
        data: {
          sessionToken: sesh
        }
      })
    } catch (error) {
      console.error('Failed to update user session token:', error)
    }
  }
  return sesh
}

export async function logoutUser() {

  cookies().set(
    'session',
    '',
    {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
      sameSite: 'lax',
    });

}

