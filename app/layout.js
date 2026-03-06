import './globals.css'

// 1. Metadata Estándar (Información de la App)
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

// 2. Configuración del Viewport (Esto quita los avisos de Vercel)
export const viewport = {
  themeColor: '#39FF14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  // ⚠️ REEMPLAZA "TU_API_KEY_AQUI" con tu clave real de Google Cloud console
  const googleMapsUrl = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDxdjJ1HyJoVgeP6NFoS2i4va-tdRjrJIA&libraries=places,geometry&callback=initMap`;

  return (
    <html lang="es">
      <head>
        {/* Cargamos FontAwesome para los iconos */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
        {/* El logo para iPhone */}
        <link rel="apple-touch-icon" href="/logo.png" />
        
        {/* Script de Google Maps Global */}
        <script src={googleMapsUrl} async defer></script>
      </head>
      <body className="antialiased bg-black text-white">
        {children}
      </body>
    </html>
  )
}
