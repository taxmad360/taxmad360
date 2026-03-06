import './globals.css'

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

export const viewport = {
  themeColor: '#39FF14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  const googleMapsUrl = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDxdjJ1HyJoVgeP6NFoS2i4va-tdRjrJIA&libraries=places,geometry`;

  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <script src={googleMapsUrl} async defer></script>
      </head>
      <body className="antialiased bg-black text-white">
        {children}
      </body>
    </html>
  )
}
