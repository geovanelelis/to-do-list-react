import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  const isAuthenticated = !!token

  // Redireciona usuário logado para o dashboard caso tente acessar /login
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Páginas privadas protegidas
  const privateRoutes = ['/dashboard', '/archived', '/create']

  if (!isAuthenticated && privateRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next() // Permite o acesso normalmente
}

export const config = {
  matcher: ['/login', '/dashboard', '/archived', '/create'],
}
