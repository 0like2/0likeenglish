"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target, Trophy, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const curriculumItems = [
    {
        step: "Step 1",
        title: "Foundation",
        subtitle: "흔들리지 않는 1등급의 시작",
        description: "문법과 어휘의 기초를 탄탄하게 다집니다. 구문 독해를 통해 문장 구조를 정확히 파악하는 능력을 기릅니다.",
        icon: BookOpen,
        color: "bg-blue-50 text-blue-600",
        colSpan: "col-span-12 md:col-span-4",
    },
    {
        step: "Step 2",
        title: "Development",
        subtitle: "실전 감각과 논리적 사고",
        description: "다양한 유형의 지문을 분석하고, 논리적인 정답 도출 과정을 훈련합니다. 취약 유형을 집중 공략하여 점수를 안정화합니다.",
        icon: Target,
        color: "bg-indigo-50 text-indigo-600",
        colSpan: "col-span-12 md:col-span-4",
    },
    {
        step: "Step 3",
        title: "Mastery",
        subtitle: "고난도 킬러 문항 정복",
        description: "수능 및 모의고사 기출 분석을 통해 출제 의도를 파악하고, 최고 난이도 문제까지 해결할 수 있는 만점 전략을 완성합니다.",
        icon: Trophy,
        color: "bg-rose-50 text-rose-600",
        colSpan: "col-span-12 md:col-span-4",
    },
];

export default function CurriculumSection() {
    return (
        <section className="py-24 bg-white">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16 space-y-4">
                    <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium bg-slate-100 text-slate-600">
                        Curriculum
                    </Badge>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
                        체계적인 <span className="text-blue-600">3-Step</span> 학습 로드맵
                    </h2>
                    <p className="text-lg text-slate-500 max-w-[600px] mx-auto">
                        기초부터 실전까지, 학생의 수준에 맞춘 최적의 커리큘럼을 제공합니다.
                    </p>
                </div>

                <div className="grid grid-cols-12 gap-6 w-full max-w-6xl mx-auto">
                    {curriculumItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className={item.colSpan}
                        >
                            <Card className="h-full border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                                <CardHeader className="space-y-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{item.step}</p>
                                        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center justify-between">
                                            {item.title}
                                            <ArrowUpRight className="w-5 h-5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <h4 className="font-semibold text-slate-700 mb-2">{item.subtitle}</h4>
                                    <CardDescription className="text-slate-500 leading-relaxed text-base">
                                        {item.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
