import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  const isAuthenticated = !!token

  if (isAuthenticated && pathname === '/auth') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const privateRoutes = ['/dashboard', '/archived', '/savedtasks', '/tasksearch']

  if (!isAuthenticated && privateRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  if (!isAuthenticated && pathname === '/') {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/auth', '/dashboard', '/archived', '/savedtasks', '/tasksearch'],
}
