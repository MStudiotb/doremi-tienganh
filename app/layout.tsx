import type { Metadata } from "next"
import { Quicksand } from "next/font/google"
import "./globals.css"
import ChatWidget from "@/components/ChatWidget"

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "DOREMI - ĐI HỌC ĐI | Học Tiếng Anh Mỗi Ngày",
  description: "Ứng dụng học tiếng Anh hiệu quả mỗi ngày - DOREMI ĐI HỌC ĐI",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className="dark bg-background">
      <body className={`${quicksand.variable} min-h-screen font-sans antialiased`}>
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
