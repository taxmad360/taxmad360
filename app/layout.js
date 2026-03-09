import './globals.css'
import { Montserrat } from 'next/font/google'
import Script from 'next/script'

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

export const metadata = {
  title: 'TaxMad – Premium TXMD',
  description: 'Black Mobility PWA',
  manifest: '/manifest.json',
  icons: {
    apple: '/logo.png', // Corregido
    icon: '/logo.png',  // Corregido
  },
}

export default function RootLayout({ children }) {
  // CORRECTO: Definimos la clave en una constante string
  // Nota: Lo ideal es usar process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const apiKey = "AIzaSyDxdjJ1HyJoVgeP6NFoS2i4va-tdRjrJIA";
  
  // CORRECTO: Usamos la variable apiKey dentro de la plantilla
  const googleMapsUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async`;

  return (
    <html lang="es">
      <body className={`${montserrat.className} bg-black text-white`}>
        {children}
        <Script src={googleMapsUrl} strategy="lazyOnload" />
      </body>
    </html>
  )
}
