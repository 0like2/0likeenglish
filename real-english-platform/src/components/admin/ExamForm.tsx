"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createExam } from "@/lib/actions/exam";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";


export default function ExamForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("High 1"); // Default

    // Arrays for answers (1-45), default 0 (unset)
    const [answers, setAnswers] = useState<number[]>(new Array(45).fill(0));

    // Set for 3-point indices
    const [threePointIndices, setThreePointIndices] = useState<Set<number>>(new Set());

    const handleAnswerChange = (index: number, value: string) => {
        const num = parseInt(value);
        if (isNaN(num)) return;
        if (num < 1 || num > 5) return; // Only 1-5 allowed

        const newAnswers = [...answers];
        newAnswers[index] = num;
        setAnswers(newAnswers);
    };

    const toggleThreePoint = (index: number) => {
        const newSet = new Set(threePointIndices);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        setThreePointIndices(newSet);
    };

    const calculateTotalScore = () => {
        let total = 0;
        for (let i = 0; i < 45; i++) {
            if (threePointIndices.has(i)) total += 3;
            else total += 2;
        }
        return total;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("시험 제목을 입력해주세요.");
            return;
        }

        if (answers.some(a => a === 0)) {
            toast.error("모든 문제의 정답을 입력해주세요.");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createExam({
                title: title,
                answers: answers,
                score_distribution: Array.from(threePointIndices),
                category: category
            });

            if (result.success) {
                toast.success(result.message);
                router.push("/admin/exams");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>기본 정보</CardTitle>
                    <CardDescription>모의고사 제목과 카테고리를 입력하세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2 md:col-span-3">
                            <Label htmlFor="title">시험 제목</Label>
                            <Input
                                id="title"
                                placeholder="예: 2024학년도 3월 전국연합학력평가"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>카테고리</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="카테고리 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High 1">고1</SelectItem>
                                    <SelectItem value="High 2">고2</SelectItem>
                                    <SelectItem value="High 3">고3</SelectItem>
                                    <SelectItem value="Middle 1">중1</SelectItem>
                                    <SelectItem value="Middle 2">중2</SelectItem>
                                    <SelectItem value="Middle 3">중3</SelectItem>
                                    <SelectItem value="TOEIC">토익</SelectItem>
                                    <SelectItem value="Other">기타</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>정답 및 배점 입력</CardTitle>
                        <CardDescription>
                            각 문항의 정답(1-5)을 입력하고, 3점 문항에는 체크해주세요.
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-500">예상 총점</div>
                        <div className={`text-2xl font-bold ${calculateTotalScore() === 100 ? 'text-green-600' : 'text-orange-500'}`}>
                            {calculateTotalScore()}점
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* 3 Columns of 15 questions each */}
                        {[0, 15, 30].map((startIndex) => (
                            <div key={startIndex} className="space-y-2">
                                {Array.from({ length: 15 }).map((_, i) => {
                                    const qIndex = startIndex + i;
                                    return (
                                        <div key={qIndex} className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                                            <div className="w-8 text-sm font-bold text-slate-500 text-center">
                                                {qIndex + 1}
                                            </div>
                                            <div className="flex-1">
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={5}
                                                    placeholder="답"
                                                    className="text-center font-medium h-9"
                                                    value={answers[qIndex] === 0 ? "" : answers[qIndex]}
                                                    onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-center gap-1.5 min-w-[3.5rem] justify-end">
                                                <Checkbox
                                                    id={`q-${qIndex}-score`}
                                                    checked={threePointIndices.has(qIndex)}
                                                    onCheckedChange={() => toggleThreePoint(qIndex)}
                                                />
                                                <Label
                                                    htmlFor={`q-${qIndex}-score`}
                                                    className="text-xs text-slate-500 cursor-pointer font-normal"
                                                >
                                                    3점
                                                </Label>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            저장 중...
                        </>
                    ) : (
                        "모의고사 등록하기"
                    )}
                </Button>
            </div>
        </form>
    );
}
