import './globals.css';
import Script from 'next/script'; // ✅ Importamos el componente Script de Next.js

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
    apple: '/logo-512.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head />
      <body className="bg-black text-white">
        {children}

        {/* ✅ Service Worker: registrado correctamente con dangerouslySetInnerHTML */}
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `
          }}
        />

        {/* ✅ Google Maps: cargado con strategy="afterInteractive" + loading=async
            Reemplaza TU_API_KEY con tu clave real de Google Cloud Console */}
        <Script
          id="google-maps"
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDxdjJ1HyJoVgeP6NFoS2i4va-tdRjrJIA&libraries=places&loading=async"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
