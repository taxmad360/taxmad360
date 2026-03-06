import './globals.css'

// 1. Metadata (SEO y PWA)
export const metadata = {
  title: 'TaxMad – Premium TXMD',
  description: 'Black Mobility PWA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TaxMad',
  },
}

// 2. Viewport (Configuración visual - Evita avisos en Vercel)
export const viewport = {
  themeColor: '#39FF14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  // Hemos quitado "&callback=initMap" para evitar errores de carga en páginas que no usan mapa
  const googleMapsUrl = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDxdjJ1HyJoVgeP6NFoS2i4va-tdRjrJIA&libraries=places,geometry`;

  return (
    <html lang="es">
      <head>
        {/* FontAwesome 6.5.1 - Versión estable para los iconos del terminal */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
        />
        {/* Icono para iPhone */}
        <link rel="apple-touch-icon" href="/logo.png" />
        
        {/* Google Maps Script */}
        <script src={googleMapsUrl} async defer></script>
      </head>
      <body className="antialiased bg-black text-white">
        {children}
      </body>
    </html>
  )
}
