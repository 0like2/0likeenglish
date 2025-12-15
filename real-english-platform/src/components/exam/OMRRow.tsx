"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface OMRRowProps {
    questionNumber: number;
    selected?: number; // 1-5
    correctAnswer?: number; // For review mode
    onSelect: (value: number) => void;
    disabled?: boolean;
}

export default function OMRRow({ questionNumber, selected, correctAnswer, onSelect, disabled }: OMRRowProps) {
    const isGraded = correctAnswer !== undefined;
    const isCorrect = isGraded && selected === correctAnswer;
    const isWrong = isGraded && selected !== correctAnswer;

    return (
        <div className={cn(
            "flex items-center justify-between py-2 px-3 rounded-lg transition-colors",
            isGraded ? (isCorrect ? "bg-green-50" : "bg-red-50") : "hover:bg-slate-50",
            selected && !isGraded ? "bg-blue-50/50" : ""
        )}>
            <div className="flex items-center gap-3 min-w-[3rem]">
                <span className={cn(
                    "font-bold text-sm",
                    isGraded ? (isCorrect ? "text-green-700" : "text-red-600") : "text-slate-700"
                )}>
                    {questionNumber}
                </span>
                {isGraded && (
                    <div className="w-5 h-5 flex items-center justify-center">
                        {isCorrect ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
                    </div>
                )}
            </div>

            <div className="flex gap-1.5 md:gap-3">
                {[1, 2, 3, 4, 5].map((num) => {
                    const isSelected = selected === num;
                    const isTargetAnswer = correctAnswer === num;

                    let buttonStyle = "border-slate-300 text-slate-500 hover:border-slate-400"; // default

                    if (isGraded) {
                        if (isTargetAnswer) {
                            buttonStyle = "bg-green-600 border-green-600 text-white font-bold ring-2 ring-green-200"; // Real Answer
                        } else if (isSelected && isWrong) {
                            buttonStyle = "bg-red-500 border-red-500 text-white opacity-80"; // Your wrong answer
                        } else {
                            buttonStyle = "border-slate-200 text-slate-300 opacity-50"; // Irrelevant (graded)
                        }
                    } else if (isSelected) {
                        buttonStyle = "bg-slate-900 border-slate-900 text-white font-bold transform scale-105 shadow-md"; // Selected (active)
                    }

                    return (
                        <button
                            key={num}
                            onClick={() => !disabled && onSelect(num)}
                            disabled={disabled}
                            className={cn(
                                "w-9 h-9 md:w-10 md:h-8 rounded-full md:rounded-md border flex items-center justify-center text-sm transition-all duration-200 cursor-pointer",
                                buttonStyle,
                                disabled && !isGraded && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <span className="md:hidden">{num}</span> {/* Circle on mobile */}
                            <span className="hidden md:inline">①②③④⑤'.substring(num-1, num)</span> {/* Circle char on desktop? Or just number? Let's use clean numbers for now or circle chars if preferred. prompt says OMR style. user circles. Let's use simple number with circle shape on mobile, rectangle on desktop? */}
                            {/* Actually, prompt said "OMR Card like grid". Usually circles or ovals. Let's stick to circles/ovals for all. */}

                            {/* Resetting content to just number for clarity */}
                            {num}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
