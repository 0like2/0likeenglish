"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
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
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 max-w-[700px] leading-relaxed"
        >
          단순한 암기가 아닌, 언어의 본질을 꿰뚫는 강의.
          <br />
          반응형 학습 관리 시스템으로 당신의 성장을 체계적으로 관리합니다.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-lg rounded-full shadow-lg shadow-blue-600/20" asChild>
            <Link href="/auth/login">
              학생 로그인 <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 px-8 h-12 text-lg rounded-full" asChild>
             <Link href="https://open.kakao.com/o/your-link" target="_blank">
               수업 문의하기
             </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
