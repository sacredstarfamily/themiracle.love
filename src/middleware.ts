import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from './lib/jwt'
// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/settings']
const adminRoutes = ['/admin']

const loginRoute = ['/auth']
export default async function middleware(req: NextRequest) {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.includes(path)

    const isAdminRoute = adminRoutes.includes(path)
    const isLoginRoute = loginRoute.includes(path)

    // 3. Decrypt the session from the cookie
    const cookiesInstance = await cookies();
    const cookie = cookiesInstance.get('session')?.value
    const session = await decrypt(cookie)
    if (isAdminRoute && session?.email !== 'seeloveinfinite@gmail.com') {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl.toString()))
    }
    // 4. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !session?.email) {
        return NextResponse.redirect(new URL('/auth', req.nextUrl.toString()))
    }

    // 5. Redirect to /dashboard if the user is authenticated
    if (req.nextUrl.pathname.startsWith('/dashboard') && !req.nextUrl.searchParams.has('token')) {
        const token = cookie?.slice(0, 60);
        return NextResponse.redirect(new URL('/dashboard?token=' + token, req.nextUrl.toString()))
    }
    if (
        isLoginRoute &&
        session?.email &&
        !req.nextUrl.pathname.startsWith('/dashboard')
    ) {
        console.log("mid" + req.nextUrl.pathname)
        const token = cookie?.slice(0, 60);
        return NextResponse.redirect(new URL('/dashboard?token=' + token, req.nextUrl.toString()))
    }

    return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}