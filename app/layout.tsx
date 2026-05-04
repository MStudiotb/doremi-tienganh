import type { Metadata } from "next"
import { Quicksand, Nunito } from "next/font/google"
import "./globals.css"
import ChatWidget from "@/components/ChatWidget"

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "DOREMI - TIẾNG ANH | Học Tiếng Anh Mỗi Ngày",
  description: "Ứng dụng học tiếng Anh hiệu quả mỗi ngày - DOREMI TIẾNG ANH",
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/logo.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DOREMI - Học Tiếng Anh',
  },
  applicationName: 'DOREMI - Học Tiếng Anh',
  themeColor: '#0d2b33',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className="dark bg-background">
      <body className={`${quicksand.variable} ${nunito.variable} min-h-screen font-sans antialiased`}>
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
