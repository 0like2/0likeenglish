import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | 리얼 영어 (REAL English)",
    default: "리얼 영어 - 진짜 실력을 만드는 영어 학습 플랫폼",
  },
  description: "학생별 맞춤 커리큘럼, 실시간 학습 관리, 풍부한 자료실까지. 리얼 영어에서 당신의 영어 실력을 완성하세요.",
  keywords: ["영어학원", "영어과외", "수능영어", "내신영어", "리얼영어"],
};

import { createClient } from "@/lib/supabase/server";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="ko">
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}>
        <Navbar user={user} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
