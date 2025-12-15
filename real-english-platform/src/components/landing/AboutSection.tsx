"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function AboutSection() {
    return (
        <section className="py-24 bg-slate-50">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
                    {/* Teacher Image & Contact */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="w-full md:w-1/3 flex flex-col items-center gap-6"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-600 rounded-full blur-2xl opacity-20"></div>
                            <Avatar className="w-64 h-64 border-4 border-white shadow-2xl bg-white">
                                <AvatarImage src="/placeholder-teacher.jpg" alt="Teacher" />
                                <AvatarFallback className="text-6xl bg-blue-50 text-blue-600 font-bold">Tc</AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Contact Info Card */}
                        <div className="w-full max-w-[280px] bg-white p-6 rounded-2xl shadow-lg border border-slate-100 space-y-4">
                            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-2">Contact</h3>
                            <div className="space-y-3 text-sm text-slate-600">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">📞</span>
                                    <span className="font-medium">010-4737-4299</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">📧</span>
                                    <span className="font-medium break-all">dudfkr21@naver.com</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">📷</span>
                                    <span className="font-medium">@_0like_</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">💬</span>
                                    <span className="font-medium">dudfkr21</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Teacher Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full md:w-2/3 space-y-8"
                    >
                        <div className="space-y-2">
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">About Teacher</Badge>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                                안녕하세요, <br />
                                <span className="text-blue-600">영어의 본질</span>을 가르치는 강사입니다.
                            </h2>
                        </div>

                        <p className="text-lg text-slate-600 leading-relaxed">
                            단순히 점수만 올리는 기술이 아니라, 평생 가는 진짜 영어 실력을 만들어 드립니다.
                            학생 한 명 한 명의 성향과 약점을 분석하여 맞춤형 커리큘럼을 제공합니다.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-200">
                            {/* Education */}
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                    <span className="w-2 h-8 bg-blue-600 rounded-full mr-3"></span>
                                    Education
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex flex-col">
                                        <span className="text-sm text-blue-600 font-semibold">2016.03 - 2019.01</span>
                                        <span className="text-slate-700 font-medium">판교 고등학교 졸업</span>
                                    </li>
                                    <li className="flex flex-col">
                                        <span className="text-sm text-blue-600 font-semibold">2020.03 ~</span>
                                        <span className="text-slate-700 font-medium">동국대학교 의생명공과 재학</span>
                                    </li>
                                    <li className="flex flex-col">
                                        <span className="text-sm text-slate-400 font-medium">2022.06 - 2023.12</span>
                                        <span className="text-slate-500">군복무</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Career */}
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                    <span className="w-2 h-8 bg-indigo-600 rounded-full mr-3"></span>
                                    Career
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 mr-2 flex-shrink-0"></span>
                                        <span className="text-slate-700">前 연세나로 국어학원 조교<br /><span className="text-xs text-slate-500">(자료편집, 질의응답)</span></span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 mr-2 flex-shrink-0"></span>
                                        <span className="text-slate-700">前 아산 국/영 특강 수업</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 mr-2 flex-shrink-0"></span>
                                        <span className="text-slate-700">前 서현고 고2 수학/국어 과외</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 mr-2 flex-shrink-0"></span>
                                        <span className="text-slate-700">前 풍산고 고2 국어 과외</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 mr-2 flex-shrink-0"></span>
                                        <span className="text-slate-700">前 저현고 고1 수학 과외</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 mr-2 flex-shrink-0"></span>
                                        <span className="text-slate-700">前 판교중 중3 - 고1 국어 과외, 학습코칭</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
