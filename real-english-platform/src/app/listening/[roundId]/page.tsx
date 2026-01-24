"use client";

import { useState, useEffect, use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Headphones, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { submitListeningExam } from "@/lib/actions/listening";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Listening Question Ranges (27 questions total)
const RANGES = [
    { start: 1, end: 20 },   // 1-20
    { start: 25, end: 28 },  // 25-28
    { start: 43, end: 45 }   // 43-45
];

interface PageProps {
    params: Promise<{
        roundId: string;
    }>;
}

export default function ListeningExamPage({ params }: PageProps) {
    const { roundId } = use(params);
    const router = useRouter();

    const [answers, setAnswers] = useState<number[]>(new Array(27).fill(0));
    const [isGraded, setIsGraded] = useState(false);
    const [showResultDialog, setShowResultDialog] = useState(false);
    const [result, setResult] = useState<{
        score: number;
        correctCount: number;
        totalCount: number;
        details: { questionIndex: number; isCorrect: boolean; studentAnswer: number; correctAnswer: number }[];
    } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Map question number to array index
    const getIndex = (qNum: number) => {
        if (qNum <= 20) return qNum - 1;
        if (qNum <= 28) return 20 + (qNum - 25);
        return 24 + (qNum - 43);
    };

    // Map array index back to question number
    const getQuestionNumber = (idx: number) => {
        if (idx < 20) return idx + 1;
        if (idx < 24) return 25 + (idx - 20);
        return 43 + (idx - 24);
    };

    const handleSelect = (qNum: number, value: number) => {
        if (isGraded) return;
        const idx = getIndex(qNum);
        const newAnswers = [...answers];
        newAnswers[idx] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        // Check if all answered
        const unanswered = answers.filter(a => a === 0).length;
        if (unanswered > 0) {
            toast.warning(`${unanswered}개 문항이 미답입니다. 제출하시겠습니까?`);
        }

        setSubmitting(true);
        const res = await submitListeningExam(roundId, answers);
        setSubmitting(false);

        if (res.success) {
            setResult({
                score: res.score!,
                correctCount: res.correctCount!,
                totalCount: res.totalCount!,
                details: res.details!
            });
            setIsGraded(true);
            setShowResultDialog(true);
            toast.success("채점이 완료되었습니다!");
        } else {
            toast.error(res.message || "채점 실패");
        }
    };

    const handleReset = () => {
        setAnswers(new Array(27).fill(0));
        setIsGraded(false);
        setShowResultDialog(false);
        setResult(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 pb-24">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/listening">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Headphones className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">듣기 평가</h1>
                            <p className="text-sm text-slate-500">총 27문항 (1~20, 25~28, 43~45)</p>
                        </div>
                    </div>
                </div>

                {/* OMR Sheet */}
                <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {RANGES.map((range, rIdx) => (
                            <div key={rIdx} className="space-y-3">
                                <h3 className="font-semibold text-slate-500 text-sm border-b pb-2">
                                    {range.start}~{range.end}번
                                </h3>
                                <div className="space-y-2">
                                    {Array.from({ length: range.end - range.start + 1 }).map((_, i) => {
                                        const qNum = range.start + i;
                                        const idx = getIndex(qNum);
                                        const selectedAnswer = answers[idx];
                                        const detail = result?.details[idx];

                                        return (
                                            <div key={qNum} className="flex items-center gap-2">
                                                <span className={`w-8 text-right font-medium ${
                                                    isGraded
                                                        ? detail?.isCorrect ? "text-green-600" : "text-red-600"
                                                        : "text-slate-600"
                                                }`}>
                                                    {qNum}.
                                                </span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((opt) => {
                                                        const isSelected = selectedAnswer === opt;
                                                        const isCorrect = detail?.correctAnswer === opt;
                                                        const isWrong = isGraded && isSelected && !detail?.isCorrect;

                                                        return (
                                                            <button
                                                                key={opt}
                                                                onClick={() => handleSelect(qNum, opt)}
                                                                disabled={isGraded}
                                                                className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                                                                    isGraded
                                                                        ? isCorrect
                                                                            ? "bg-green-500 text-white"
                                                                            : isWrong
                                                                                ? "bg-red-500 text-white"
                                                                                : "bg-slate-100 text-slate-400"
                                                                        : isSelected
                                                                            ? "bg-purple-600 text-white"
                                                                            : "bg-slate-100 text-slate-600 hover:bg-purple-100"
                                                                }`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {isGraded && (
                                                    <span className="ml-1">
                                                        {detail?.isCorrect
                                                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            : <XCircle className="w-4 h-4 text-red-500" />
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Submit Button */}
                <div className="sticky bottom-6 z-10">
                    {!isGraded ? (
                        <Button
                            size="lg"
                            className="w-full h-14 text-lg font-bold rounded-full shadow-xl bg-purple-600 hover:bg-purple-700"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    채점 중...
                                </>
                            ) : (
                                "채점하기"
                            )}
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex-1 h-14 text-lg font-bold rounded-full"
                                onClick={handleReset}
                            >
                                다시 풀기
                            </Button>
                            <Button
                                size="lg"
                                className="flex-1 h-14 text-lg font-bold rounded-full bg-purple-600"
                                asChild
                            >
                                <Link href="/listening">
                                    목록으로
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Result Dialog */}
                <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-center text-2xl font-bold">채점 결과</DialogTitle>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                            <div className="text-center">
                                <p className="text-sm text-slate-500 mb-2">총점</p>
                                <p className="text-5xl font-bold text-purple-600">{result?.score}<span className="text-2xl">점</span></p>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                                <span className="text-slate-600">맞은 개수</span>
                                <span className="font-bold text-slate-900">
                                    {result?.correctCount} / {result?.totalCount}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                                <span className="text-green-600">정답률</span>
                                <span className="font-bold text-green-700">
                                    {result ? Math.round((result.correctCount / result.totalCount) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button className="w-full bg-purple-600" onClick={() => setShowResultDialog(false)}>
                                확인하고 오답 보기
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
