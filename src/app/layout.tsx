import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/shared/Toaster";

const zenMaru = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "SalonLink — ネイルサロンのための、自社集客サービス",
  description:
    "ホットペッパーからの新規顧客を、自社の常連さまへ。LINE連携で予約・クーポン・メッセージ配信がひとつにまとまる、個人サロンのための SaaS。月額 3,980 円から。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${zenMaru.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}
