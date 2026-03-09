import './globals.css'
import { Montserrat } from 'next/font/google' // Carga optimizada de fuente
import Script from 'next/script'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '700', '900'] })

export const metadata = {
  title: 'TaxMad – Premium TXMD',
  description: 'Black Mobility PWA',
  manifest: '/manifest.json',
  icons: { icon: '/logotipo.png', apple: '/logotipo.png' },
}

export default function RootLayout({ children }) {
  // USAR VARIABLE DE ENTORNO PARA LA KEY
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; 
  const googleMapsUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async`;

  return (
    <html lang="es">
      <body className={`${montserrat.className} antialiased bg-black text-white`}>
        <main className="min-h-screen">{children}</main>
        <Script src={googleMapsUrl} strategy="lazyOnload" />
      </body>
    </html>
  )
}
