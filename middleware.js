import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Si alguien intenta entrar a /admin o /drivers sin permiso
  // Por ahora solo registramos en consola, luego pondremos el bloqueo real
  if (pathname.startsWith('/admin')) {
    console.log("👮 Acceso a Zona de Control: ", pathname)
  }

  if (pathname.startsWith('/drivers')) {
    console.log("🚖 Acceso a Terminal de Conductor: ", pathname)
  }

  return NextResponse.next()
}

// Esto le dice a Next.js que solo actúe en estas rutas
export const config = {
  matcher: ['/admin/:path*', '/drivers/:path*'],
}
