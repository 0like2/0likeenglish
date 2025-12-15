"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function AboutSection() {
    return (
        <section className="py-24 bg-slate-50">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
                    {/* Teacher Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="w-full md:w-1/3 flex justify-center"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-600 rounded-full blur-2xl opacity-20"></div>
                            <Avatar className="w-64 h-64 border-4 border-white shadow-2xl">
                                <AvatarImage src="/placeholder-teacher.jpg" alt="Teacher" />
                                <AvatarFallback className="text-4xl bg-blue-100 text-blue-600">Tc</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg animate-bounce">
                                <p className="font-bold text-blue-600">10년+</p>
                                <p className="text-xs text-slate-500">강의 경력</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Teacher Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full md:w-2/3 space-y-6"
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

                        {/* Timeline / Experience */}
                        <div className="space-y-4 pt-4 border-t border-slate-200">
                            <div className="flex items-start gap-4">
                                <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-800">대치동 입시 학원 전임 강사 (2018 - 2023)</h4>
                                    <p className="text-slate-500 text-sm">최상위권 반 전담, 특목고 입시 지도</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-800">REAL English 과외 런칭 (2024 - 현재)</h4>
                                    <p className="text-slate-500 text-sm">1:1 맞춤형 프리미엄 과외 서비스</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-2 h-2 mt-2 rounded-full bg-blue-600 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-800">영어교육학 석사</h4>
                                    <p className="text-slate-500 text-sm">영어 습득 이론 기반의 과학적 교수법 적용</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
