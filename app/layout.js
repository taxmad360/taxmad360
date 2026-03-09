import './globals.css'
import { Montserrat } from 'next/font/google'
import Script from 'next/script'

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

export const metadata = {
  title: 'TaxMad – Premium TXMD',
  manifest: '/manifest.json',
  icons: {
    icon: '/logotipo.png',
    apple: '/logotipo.png',
  },
}

export default function RootLayout({ children }) {
  // NOTA: Usa una variable de entorno para mayor seguridad.
  // En tu archivo .env.local, pon: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave_aqui
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDxdjJ1HyJoVgeP6NFoS2i4va-tdRjrJIA  
  // URL con loading=async para eliminar el error de consola y mejorar rendimiento
  const googleMapsUrl = `https://maps.googleapis.com/maps/api/js?key=${AIzaSyDxdjJ1HyJoVgeP6NFoS2i4va-tdRjrJIA}&libraries=places,geometry&loading=async`;

  return (
    <html lang="es">
      <body className={`${montserrat.className} bg-black text-white`}>
        {children}
        <Script src={googleMapsUrl} strategy="lazyOnload" />
      </body>
    </html>
  )
}
