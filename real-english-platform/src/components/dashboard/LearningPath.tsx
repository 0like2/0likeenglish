"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock Data based on Notion
const QUESTS = [
    { id: "vocab-3x", title: "단어 3회독 (Wordmaster)", date: "매일", status: "current", type: "Daily Routine" },
    { id: "type-solving", title: "유형별 문제 풀이 (빈칸/순서)", date: "주 3회", status: "current", type: "Weakness" },
    { id: "keywording", title: "Keywording & Linking 연습", date: "수업 후", status: "current", type: "Review" },
    { id: "mock-exam", title: "[매주] 평가원 모의고사 풀이", date: "주말", status: "locked", type: "Mock Exam" },
    { id: "listening", title: "영어 듣기 숙제 (Dictation)", date: "화/목", status: "locked", type: "Listening" },
    { id: "flow", title: "Flow (오리엔테이션 & 커리큘럼)", date: "완료", status: "completed", type: "Intro" },
];

export default function LearningPath() {
    return (
        <Card className="shadow-sm border-slate-100 col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    📝 이번 주 학습 퀘스트
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {QUESTS.map((quest, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border transition-all",
                                quest.status === 'current' ? "bg-white border-blue-200 shadow-md scale-[1.02]"
                                    : quest.status === 'completed' ? "bg-green-50 border-green-100 opacity-80"
                                        : "bg-slate-50 border-slate-100 opacity-60"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2",
                                    quest.status === 'completed' ? "bg-green-100 border-green-200 text-green-600"
                                        : quest.status === 'current' ? "bg-blue-100 border-blue-200 text-blue-600 animate-pulse"
                                            : "bg-slate-100 border-slate-200 text-slate-400"
                                )}>
                                    {quest.status === 'completed' ? <CheckCircle2 className="w-6 h-6" />
                                        : quest.status === 'locked' ? <Lock className="w-5 h-5" />
                                            : <Circle className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs font-normal bg-white/50">
                                            {quest.type}
                                        </Badge>
                                        <span className="text-xs text-slate-400">{quest.date}</span>
                                    </div>
                                    <h4 className={cn("font-bold", quest.status === 'current' ? "text-slate-900" : "text-slate-600")}>
                                        {quest.title}
                                    </h4>
                                </div>
                            </div>

                            {quest.status === 'current' && (
                                <Link href={`/blog/learning-method?topic=${quest.id}`}>
                                    <Badge className="bg-blue-600 hover:bg-blue-700 cursor-pointer pl-3 pr-2 py-1.5 transition-colors">
                                        학습법 보기 <ArrowRight className="w-3 h-3 ml-1" />
                                    </Badge>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
