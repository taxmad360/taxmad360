import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'TaxMad – Premium TXMD',
  description: 'Black Mobility PWA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TaxMad',
  },
  icons: {
    // Cambiado de /logo.png a /logotipo.png para coincidir con tu carpeta public
    apple: '/logotipo.png',
    icon: '/logotipo.png',
  },
}

export const viewport = {
  themeColor: '#39FF14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  // Se añade loading=async en la URL para resolver el warning de la consola
  const googleMapsUrl = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDxdjJ1HyJoVgeP6NFoS2i4va-tdRjrJIA&libraries=places,geometry&loading=async`;

  return (
    <html lang="es">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
        />
      </head>
      <body className="antialiased bg-black text-white">
        <main className="min-h-screen">
          {children}
        </main>
        {/* Usamos lazyOnload para que no interfiera con la carga inicial de la PWA */}
        <Script src={googleMapsUrl} strategy="lazyOnload" />
      </body>
    </html>
  )
}
