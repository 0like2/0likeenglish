"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target, Trophy, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const curriculumItems = [
    {
        step: "Step 1",
        title: "Foundation",
        subtitle: "기초 (Basic Stage): Foundation",
        description: "수능 영어의 첫걸음을 위한 필수 기본기 다지기 과정. 문법과 어휘의 기초를 탄탄하게 다집니다.",
        icon: BookOpen,
        color: "bg-blue-50 text-blue-600",
        colSpan: "col-span-12 md:col-span-4",
        details: [
            {
                title: "020 : zero to zero",
                items: [
                    "탄탄한 문법 기초 확립",
                    "빠른 독해를 위한 구문 원리 학습",
                    "문장 구조 분석 능력 향상"
                ]
            },
            {
                title: "교재 구성",
                items: [
                    "이론편: Keywording & Linking 기초 이론 및 파편화한 세부 문제",
                    "Workbook: 수능 3개년 지문 집중 분석"
                ]
            },
            {
                title: "The 57 Points : first to final",
                items: [
                    "듣기 및 쉬운문제 실전 문제풀이 Tip",
                    "실전 듣기 연습 및 피드백",
                    "주 3회 쉬운문제 및 듣기 풀이 과제 중심 수업"
                ]
            }
        ]
    },
    {
        step: "Step 2",
        title: "Development",
        subtitle: "심화 (Intermediate Stage): In-depth",
        description: "기출 분석과 논리적 사고를 통해 문제 해결 능력을 향상시키는 단계. 다양한 유형의 지문을 분석합니다.",
        icon: Target,
        color: "bg-indigo-50 text-indigo-600",
        colSpan: "col-span-12 md:col-span-4",
        details: [
            {
                title: "Code & Logic",
                items: [
                    "기출 문제 분석을 통한 논리력 강화",
                    "문제 해결 전략 및 심화 독해 훈련",
                    "Keywording & Linking 과 유형별 code & logic으로의 연계!"
                ]
            },
            {
                title: "Keywording & Linking 중점의 1회차 풀이",
                items: [
                    "Keywording & Linking 기반의 정직한 base 풀이"
                ]
            },
            {
                title: "Code 중점 심화 실전 중점의 2회차 풀이",
                items: [
                    "Flow를 적용하여 글의 강약/주제 파악"
                ]
            }
        ]
    },
    {
        step: "Step 3",
        title: "Mastery",
        subtitle: "실전 (Advanced Stage): Practice",
        description: "실전 모의고사와 고강도 훈련으로 만점을 향한 최종 점검 단계. 고난도 킬러 문항을 정복합니다.",
        icon: Trophy,
        color: "bg-rose-50 text-rose-600",
        colSpan: "col-span-12 md:col-span-4",
        details: [
            {
                title: "실전모의고사 (Actual Practice Exams)",
                items: [
                    "실제 시험과 동일한 환경(실제 시험지 형식, OMR)",
                    "개별 문항별 상세 피드백(개별 필기 feedback)",
                    "모의고사별 단어 test 및 word workbook 제공"
                ]
            },
            {
                title: "2021-2025년 평가원 모의고사",
                items: [
                    "6, 9, 수능 평가원 code 분석"
                ]
            },
            {
                title: "실전 사설 모의고사 X 평가원/교육청 기출",
                items: [
                    "교육청, 사설 모의고사에서 curation한 실전 workbook!"
                ]
            },
            {
                title: "EBS & Hard Training",
                items: [
                    "EBS 연계 교재 완벽 분석",
                    "유형별/주제별 심층 문제 풀이",
                    "최상위권 도약을 위한 고강도 훈련"
                ]
            }
        ]
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
                        <Dialog key={index}>
                            <DialogTrigger asChild>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className={`${item.colSpan} cursor-pointer group`}
                                >
                                    <Card className="h-full border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
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
                                            <h4 className="font-semibold text-slate-700 mb-2 truncate">{item.subtitle}</h4>
                                            <CardDescription className="text-slate-500 leading-relaxed text-base line-clamp-3">
                                                {item.description}
                                            </CardDescription>
                                            <p className="mt-4 text-sm text-blue-600 font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                상세 커리큘럼 보기 <ArrowUpRight className="w-4 h-4 ml-1" />
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${item.color}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <DialogTitle className="text-2xl font-bold text-slate-900 pb-2">
                                        {item.subtitle}
                                    </DialogTitle>
                                    <DialogDescription className="text-base">
                                        {item.description}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="mt-6 space-y-8">
                                    {item.details.map((detail, dIndex) => (
                                        <div key={dIndex} className="space-y-3">
                                            <h4 className="text-lg font-bold text-slate-800 flex items-center">
                                                <Badge variant="outline" className="mr-2 border-slate-300 text-slate-600 w-6 h-6 flex items-center justify-center p-0 rounded-full text-xs">
                                                    {dIndex + 1}
                                                </Badge>
                                                {detail.title}
                                            </h4>
                                            <ul className="space-y-2 pl-2">
                                                {detail.items.map((desc, i) => (
                                                    <li key={i} className="flex items-start text-slate-600 text-sm md:text-base bg-slate-50 p-3 rounded-lg">
                                                        <CheckCircle2 className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                                        <span className="leading-relaxed">{desc}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>
            </div>
        </section>
    );
}
