import "./globals.css";

export const metadata = {
  title: "Ekalaya 3D Virtual Office — Kantor Virtual Modern & Interaktif",
  description: "Bekerja bersama tim di kantor virtual 3D interaktif berbasis browser ala Roblox. Bergerak bebas, obrolan spasial, ruang meeting, dan pantry santai.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ekalaya Office",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full w-full overflow-hidden">
      <body className="h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans select-none fixed inset-0 touch-none">
        {children}
      </body>
    </html>
  );
}
