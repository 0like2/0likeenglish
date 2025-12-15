"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, CheckCircle2, Star } from "lucide-react";
import Link from "next/link";

export default function LearningMethodPage() {
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic');

    // Content Mapper (In real app, this would be from DB or Markdown files)
    const getContent = () => {
        if (topic === 'vocab-3x' || !topic) { // Default to vocab for demo
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="border-b border-slate-200 pb-6">
                        <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1">
                            Daily Routine
                        </Badge>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            📘 단어 1회독 완벽 가이드
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Wordmaster 하루 분량을 가장 효율적으로 암기하는 2단계 학습법입니다.
                        </p>
                    </div>

                    {/* Step 1 */}
                    <Card className="border-2 border-blue-100 shadow-sm overflow-hidden">
                        <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                            <h2 className="text-xl font-bold text-slate-800">새로운 Day 공부하기</h2>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1"><BookOpen className="w-5 h-5 text-blue-500" /></div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">쓰면서 암기하기</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        1. 영어 스펠링을 한 번 쓰고, 소리 내어 <strong>발음</strong>해보고, 한글 뜻을 적습니다.<br />
                                        2. 그 다음, 영어 단어만 <strong>2번 더 쓰면서</strong> 눈으로는 한글 뜻을 읽습니다.
                                        <span className="text-sm text-slate-400 block mt-1">(손과 눈과 입을 동시에 사용해야 기억에 오래 남아요!)</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1"><Star className="w-5 h-5 text-amber-400 fill-amber-400" /></div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">반 접어서 셀프 테스트</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        한 페이지를 다 적었다면, 종이를 <strong>반으로 접어</strong> 한글 뜻만 보고 영단어를 말해보세요.<br />
                                        기억이 안 나는 단어는 가차 없이 <span className="text-amber-600 font-bold bg-amber-50 px-1 rounded">별표(★) 체크</span>를 해둡니다.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Step 2 */}
                    <Card className="border-2 border-slate-100 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold">2</div>
                            <h2 className="text-xl font-bold text-slate-800">누적 복습하기 (Review)</h2>
                        </div>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">전날 배운 것까지 테스트</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 mb-2">
                                        <strong>예시)</strong> 오늘이 <span className="text-blue-600">Day 05</span>라면?<br />
                                        👉 <span className="underline decoration-blue-300 decoration-2">Day 01부터 Day 04까지</span> 모든 단어를 다시 테스트합니다.
                                    </div>
                                    <p className="text-slate-600 leading-relaxed">
                                        접어둔 상태 그대로 다시 봅니다.<br />
                                        이번에도 기억이 안 나면 <strong>형광펜</strong>으로 찐하게 표시해두세요! 🖍️
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1"><div className="w-2 h-2 rounded-full bg-slate-400 mt-2" /></div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">틀린 단어 재암기</h3>
                                    <p className="text-slate-600">
                                        형광펜으로 표시된 '진짜 모르는 단어'들을 집중적으로 다시 외워줍니다.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                        <h3 className="text-lg font-bold text-blue-900 mb-2">오늘 공부 시작할 준비 되셨나요?</h3>
                        <p className="text-blue-700 mb-6">위 방법대로 Day 1회독을 완료하고 인증샷을 남겨주세요!</p>
                        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 shadow-lg shadow-blue-200">
                            <Link href="/dashboard">
                                인증하러 가기
                            </Link>
                        </Button>
                    </div>
                </div>
            );
        }

        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-slate-400">준비 중인 학습 가이드입니다.</h2>
                <Button asChild variant="outline" className="mt-4">
                    <Link href="/dashboard">돌아가기</Link>
                </Button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
                    <Button asChild variant="ghost" size="sm" className="-ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                        <Link href="/dashboard">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            돌아가기
                        </Link>
                    </Button>
                    <span className="mx-auto font-medium text-slate-900">학습 가이드</span>
                    <div className="w-20" /> {/* Spacer for centering */}
                </div>
            </div>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
                {getContent()}
            </main>
        </div>
    );
}
