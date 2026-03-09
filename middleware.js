import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // 1. Obtener sesión actual
  const { data: { session } } = await supabase.auth.getSession()

  // 2. Proteger rutas: Si no hay sesión, redirigir al login
  if (!session) {
    if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/drivers')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/drivers/:path*'],
}
