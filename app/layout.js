import './globals.css'

export const metadata = {
  title: 'TaxMad – Premium TXMD',
  description: 'Black Mobility PWA',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  manifest: '/manifest.json',
  themeColor: '#39FF14',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TaxMad',
  },
}

export default function RootLayout({ children }) {
  // REEMPLAZA "TU_API_KEY_AQUI" con tu clave real de Google Cloud console
  const googleMapsUrl = `https://maps.googleapis.com/maps/api/js?key=TU_API_KEY_AQUI&libraries=places,geometry&loading=async`;

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
