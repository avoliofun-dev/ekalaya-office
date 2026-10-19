import "./globals.css";

export const metadata = {
  title: "Ekalaya 3D Virtual Office — Kantor Virtual Modern & Interaktif",
  description: "Bekerja bersama tim di kantor virtual 3D interaktif berbasis browser ala Roblox. Bergerak bebas, obrolan spasial, ruang meeting, dan pantry santai.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full">
      <body className="h-full bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
        {children}
      </body>
    </html>
  );
}
