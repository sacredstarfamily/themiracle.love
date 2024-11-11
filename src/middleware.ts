import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from './lib/sessions'
import { cookies } from 'next/headers'

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/settings']
const adminRoutes = ['/admin']
const publicRoutes = ['/auth', '/', '/shop']

export default async function middleware(req: NextRequest) {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.includes(path)
    const isPublicRoute = publicRoutes.includes(path)
    const isAdminRoute = adminRoutes.includes(path)

    // 3. Decrypt the session from the cookie
    const cookie = cookies().get('session')?.value
    const session = await decrypt(cookie)
    if (isAdminRoute && session?.email !== 'seeloveinfinite@gmail.com') {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }
    // 4. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !session?.email) {

        return NextResponse.redirect(new URL('/auth', req.nextUrl))
    }

    // 5. Redirect to /dashboard if the user is authenticated
    if (
        isPublicRoute &&
        session?.e &&
        !req.nextUrl.pathname.startsWith('/dashboard')
    ) {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }

    return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}