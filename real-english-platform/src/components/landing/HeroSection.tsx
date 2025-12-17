"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";

export default function HeroSection() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [supabase]);

  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-50">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-3xl" />
      </div>

      <div className="container px-4 md:px-6 z-10 flex flex-col items-center text-center space-y-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            <span>2025년 수강생 모집 중</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-slate-900 leading-[1.2]"
        >
          Real English, <br className="md:hidden" />
          <span className="text-blue-600">진짜 실력</span>을 만드는 곳
          <span className="text-2xl md:text-4xl font-medium text-slate-600 mt-4 block tracking-normal">
            수능영어는 0like 이영락
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 max-w-[800px] leading-relaxed break-keep"
        >
          Olike 영어 커리큘럼은 여러분의 성공적인 수능을 위해 <b className="text-slate-800">효율</b>을 중점으로 설계되었습니다.
          <br className="hidden md:block" />
          절대 평가 시대의 영어! 짧은 시간 정확한 풀이로 효율적으로 공부해야 합니다!
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          {!loading && (
            <>
              {user ? (
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 h-12 text-lg rounded-full shadow-lg shadow-blue-600/20" asChild>
                  <Link href="/dashboard">
                    <User className="mr-2 w-5 h-5" />
                    마이페이지
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 h-12 text-lg rounded-full shadow-lg shadow-blue-600/20" asChild>
                  <Link href="/auth/login">
                    로그인
                  </Link>
                </Button>
              )}
            </>
          )}

          <Button size="lg" variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 px-8 h-12 text-lg rounded-full" asChild>
            <Link href="https://open.kakao.com/o/sHwY2QOg" target="_blank">
              수업 문의하기
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
