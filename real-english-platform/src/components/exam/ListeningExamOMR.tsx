"use client";

import { useState } from "react";
import OMRRow from "./OMRRow";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle } from "lucide-react";

// Mock Key for Listening (27 questions)
const LISTENING_KEY = [
    3, 1, 2, 5, 4, 1, 2, 3, 4, 5, // 1-10
    5, 4, 3, 2, 1, 2, 3, 4, 5, 1, // 11-20
    2, 3, 4, 5,                   // 25-28 (mapped index 20-23)
    1, 3, 5                       // 43-45 (mapped index 24-26)
];
const RANGES = [
    { start: 1, end: 20 },
    { start: 25, end: 28 },
    { start: 43, end: 45 }
];

export default function ListeningExamOMR() {
    const [answers, setAnswers] = useState<number[]>(new Array(27).fill(0));
    const [isGraded, setIsGraded] = useState(false);
    const [showResultDialog, setShowResultDialog] = useState(false);
    const [score, setScore] = useState(0);

    // Helper to map visual question number to array index
    const getIndex = (qNum: number) => {
        if (qNum <= 20) return qNum - 1;
        if (qNum <= 28) return 20 + (qNum - 25);
        return 24 + (qNum - 43);
    };

    const handleSelect = (qNum: number, value: number) => {
        if (isGraded) return;
        const idx = getIndex(qNum);
        const newAnswers = [...answers];
        newAnswers[idx] = value;
        setAnswers(newAnswers);
    };

    const handleGrade = () => {
        let correctCount = 0;
        answers.forEach((ans, idx) => {
            if (ans === LISTENING_KEY[idx]) correctCount++;
        });

        // Simple Score: correct / 27 * 100
        setScore(Math.round((correctCount / 27) * 100));
        setIsGraded(true);
        setShowResultDialog(true);
    };

    const handleReset = () => {
        setAnswers(new Array(27).fill(0));
        setIsGraded(false);
        setShowResultDialog(false);
        setScore(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">12월 듣기 평가</h2>
                <p className="text-slate-500">
                    제외 문항: 21~24번, 29~42번 (총 27문항)
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                {RANGES.map((range, rIdx) => (
                    <div key={`range-${rIdx}`} className="space-y-4 col-span-full md:col-span-1 border-b md:border-b-0 pb-4 md:pb-0">
                        <h3 className="font-semibold text-slate-400 text-sm uppercase mb-2 ml-2">Questions {range.start}-{range.end}</h3>
                        <div className="space-y-2">
                            {Array.from({ length: range.end - range.start + 1 }).map((_, i) => {
                                const qNum = range.start + i;
                                const idx = getIndex(qNum);
                                return (
                                    <OMRRow
                                        key={qNum}
                                        questionNumber={qNum}
                                        selected={answers[idx]}
                                        correctAnswer={isGraded ? LISTENING_KEY[idx] : undefined}
                                        onSelect={(val) => handleSelect(qNum, val)}
                                        disabled={isGraded}
                                    />
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="sticky bottom-6 flex justify-center pb-8 z-10">
                {!isGraded ? (
                    <Button
                        size="lg"
                        className="w-full max-w-md h-14 text-lg font-bold rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300"
                        onClick={handleGrade}
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
                        <DialogTitle className="text-center text-2xl font-bold">채점 결과</DialogTitle>
                        <DialogDescription className="text-center text-lg">
                            총점 <span className="text-3xl font-bold text-slate-900 mx-1">{score}</span> 점
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">맞은 개수</span>
                            <span className="font-bold text-slate-900">{answers.filter((a, i) => a === LISTENING_KEY[i]).length} / 27</span>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <Button className="w-full" onClick={() => setShowResultDialog(false)}>확인</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
