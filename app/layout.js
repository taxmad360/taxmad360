import './globals.css'
import { Montserrat } from 'next/font/google'
import Script from 'next/script'

const montserrat = Montserrat({ 
  subsets: ['latin'], 
  variable: '--font-montserrat' 
})

export const metadata = {
  title: 'TaxMad – Premium TXMD',
  description: 'Black Mobility PWA',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TaxMad',
  },
  icons: {
    apple: '/logo.png',
    icon: '/logo.png',
  },
}

export default function RootLayout({ children }) {
  // Asegúrate de tener la variable en tu archivo .env.local
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;AIzaSyDxdjJ1HyJoVgeP6NFoS2i4va-tdRjrJIA
    const googleMapsUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async`;

  return (
    <html lang="es" className={montserrat.variable}>
      <body className="antialiased bg-black text-white font-sans">
        {children}
        <Script src={googleMapsUrl} strategy="afterInteractive" />
      </body>
    </html>
  )
}
