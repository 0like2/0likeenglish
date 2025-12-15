"use client";

import { useState } from "react";
import OMRRow from "./OMRRow";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { MOCK_EXAM_KEY, MOCK_EXAM_KEY_TITLE } from "@/lib/mockData";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function MockExamOMR() {
    const [answers, setAnswers] = useState<number[]>(new Array(45).fill(0));
    const [isGraded, setIsGraded] = useState(false);
    const [showResultDialog, setShowResultDialog] = useState(false);
    const [score, setScore] = useState(0);

    const handleSelect = (questionIndex: number, value: number) => {
        if (isGraded) return;
        const newAnswers = [...answers];
        newAnswers[questionIndex] = value;
        setAnswers(newAnswers);
    };

    const handleGrade = () => {
        // Basic validation: Check if all answered? Or allow incomplete?
        // Let's allow incomplete but warn? For now, just grade.

        let correctCount = 0;
        answers.forEach((ans, idx) => {
            if (ans === MOCK_EXAM_KEY[idx]) correctCount++;
        });

        // Score calculation logic (Simplified: Each question ~2.2 points or just count)
        // Real SAT has diverse points. Let's precise: 2pts, 3pts. 
        // For MVP, let's assume raw score = correctCount based (or just standard 100 max)
        const calculatedScore = Math.round((correctCount / 45) * 100);
        setScore(calculatedScore);
        setIsGraded(true);
        setShowResultDialog(true);
    };

    const handleReset = () => {
        setAnswers(new Array(45).fill(0));
        setIsGraded(false);
        setShowResultDialog(false);
        setScore(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">{MOCK_EXAM_KEY_TITLE}</h2>
                <p className="text-slate-500">
                    실전처럼 시간을 재고 풀어보세요. 답안을 모두 체크한 후 '채점하기'를 누르세요.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                {/* Split into 3 columns for better desktop view */}
                {[0, 15, 30].map((startIndex) => (
                    <div key={startIndex} className="space-y-2">
                        {Array.from({ length: 15 }).map((_, i) => {
                            const qIndex = startIndex + i;
                            // Check if out of bounds (though 45 is divisible by 3)
                            if (qIndex >= 45) return null;

                            return (
                                <OMRRow
                                    key={qIndex}
                                    questionNumber={qIndex + 1}
                                    selected={answers[qIndex]}
                                    correctAnswer={isGraded ? MOCK_EXAM_KEY[qIndex] : undefined}
                                    onSelect={(val) => handleSelect(qIndex, val)}
                                    disabled={isGraded}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="sticky bottom-6 flex justify-center pb-8 z-10">
                {!isGraded ? (
                    <Button
                        size="lg"
                        className="w-full max-w-md h-14 text-lg font-bold rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300"
                        onClick={handleGrade}
                        disabled={answers.every(a => a === 0)} // Disable if completely empty
                    >
                        채점하기
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full max-w-md h-14 text-lg font-bold rounded-full shadow-lg bg-white hover:bg-slate-50 border-slate-300"
                        onClick={handleReset}
                    >
                        다시 풀기
                    </Button>
                )}
            </div>

            <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold flex flex-col items-center gap-2">
                            {score >= 90 ? (
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                                    <AlertCircle className="w-10 h-10 text-blue-600" />
                                </div>
                            )}
                            채점 결과
                        </DialogTitle>
                        <DialogDescription className="text-center text-lg">
                            총점 <span className="text-3xl font-bold text-slate-900 mx-1">{score}</span> 점
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-600">맞은 개수</span>
                                <span className="font-bold text-slate-900">{answers.filter((a, i) => a === MOCK_EXAM_KEY[i]).length} / 45</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                <span className="text-red-600">틀린 개수</span>
                                <span className="font-bold text-red-900">{answers.filter((a, i) => a !== 0 && a !== MOCK_EXAM_KEY[i]).length}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <Button className="w-full" onClick={() => setShowResultDialog(false)}>
                            상세 결과 확인하기
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
