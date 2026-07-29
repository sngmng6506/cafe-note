import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cafe Note",
  description: "개인용 네이버 카페 리뷰 작성 보조 웹앱",
  appleWebApp: { capable: true, title: "Cafe Note", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8fafc"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body>{children}</body></html>;
}
