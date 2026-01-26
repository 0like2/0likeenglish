"use client";

import { useState, useTransition } from "react";
import { toggleVocabTest } from "@/lib/actions/check";
import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
    id: string;
    name: string;
    vocabTestPassed: boolean | null;
}

interface VocabTestCheckerProps {
    lessonId: string;
    students: Student[];
}

export default function VocabTestChecker({ lessonId, students }: VocabTestCheckerProps) {
    const [studentStates, setStudentStates] = useState<Map<string, boolean | null>>(
        new Map(students.map(s => [s.id, s.vocabTestPassed]))
    );
    const [isPending, startTransition] = useTransition();

    const handleToggle = (studentId: string) => {
        startTransition(async () => {
            const result = await toggleVocabTest(studentId, lessonId);
            if (result.success && 'newValue' in result) {
                setStudentStates(prev => {
                    const next = new Map(prev);
                    next.set(studentId, result.newValue as boolean | null);
                    return next;
                });
            }
        });
    };

    if (students.length === 0) {
        return (
            <div className="text-sm text-slate-400 py-2">
                수강생이 없습니다.
            </div>
        );
    }

    return (
        <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">단어 테스트</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {students.map((student) => {
                    const status = studentStates.get(student.id);
                    return (
                        <button
                            key={student.id}
                            onClick={() => handleToggle(student.id)}
                            disabled={isPending}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border",
                                status === true && "bg-green-50 border-green-300 text-green-700",
                                status === false && "bg-red-50 border-red-300 text-red-700",
                                status === null && "bg-slate-50 border-slate-200 text-slate-600",
                                isPending && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <span className="flex-shrink-0">
                                {status === true && <Check className="w-4 h-4" />}
                                {status === false && <X className="w-4 h-4" />}
                                {status === null && <Minus className="w-4 h-4" />}
                            </span>
                            <span className="truncate">{student.name}</span>
                        </button>
                    );
                })}
            </div>
            <p className="text-xs text-slate-400 mt-2">
                클릭하여 변경: 미체크 → 통과 → 불통과 → 미체크
            </p>
        </div>
    );
}
