import './globals.css'
import { Montserrat } from 'next/font/google'
import Script from 'next/script'

// Carga optimizada de la fuente para evitar el fallo de globals.css
const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-montserrat' 
})

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
  // RECOMENDACIÓN: Mueve esta clave a tu archivo .env.local como NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || AIzaSyDxdjJ1HyJoVgeP6NFoS2i4va-tdRjrJIA;
  const googleMapsUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async`;

  return (
    <html lang="es">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
        />
      </head>
      <body className={`${montserrat.className} antialiased bg-black text-white`}>
        <main className="min-h-screen">
          {children}
        </main>
        <Script src={googleMapsUrl} strategy="lazyOnload" />
      </body>
    </html>
  )
}
