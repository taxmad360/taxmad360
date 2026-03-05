import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // 1. Definimos qué rutas queremos proteger
  // Por ejemplo: /admin y /drivers
  
  if (pathname.startsWith('/admin')) {
    // Aquí podrías verificar una cookie de sesión
    // Por ahora, es un recordatorio de que aquí irá la lógica de bloqueo
    console.log("Intento de acceso a zona de administración");
  }

  if (pathname.startsWith('/drivers')) {
    console.log("Acceso a terminal de conductor");
  }

  return NextResponse.next()
}

// Configura en qué rutas se debe ejecutar el middleware
export const config = {
  matcher: ['/admin/:path*', '/drivers/:path*'],
}
