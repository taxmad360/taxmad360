import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Registros en consola (Solo para desarrollo)
  if (pathname.startsWith('/admin')) {
    console.log("👮 Acceso a Zona de Control: ", pathname)
  }

  if (pathname.startsWith('/drivers')) {
    console.log("🚖 Acceso a Terminal de Conductor: ", pathname)
  }

  return NextResponse.next()
}

// Configuración del matcher (Asegúrate de que no haya puntos extra aquí)
export const config = {
  matcher: ['/admin/:path*', '/drivers/:path*'],
}
