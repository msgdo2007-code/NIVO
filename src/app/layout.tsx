import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "NIVO — Seu universo digital", template: "%s · NIVO" },
  description: "Reúna seus links, conteúdos e identidade em um universo totalmente personalizado.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
