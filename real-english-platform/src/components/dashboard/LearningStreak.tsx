"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Calendar, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningStreakProps {
    currentStreak: number;
    longestStreak: number;
    thisMonthDays: number;
    totalDays: number;
    recentActivity: boolean[]; // Last 7 days, true = active
}

export default function LearningStreak({
    currentStreak = 0,
    longestStreak = 0,
    thisMonthDays = 0,
    totalDays = 30,
    recentActivity = []
}: LearningStreakProps) {
    const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date().getDay();

    // Reorder to show last 7 days ending with today
    const orderedDays = [];
    for (let i = 6; i >= 0; i--) {
        const dayIndex = (today - i + 7) % 7;
        orderedDays.push({
            label: dayLabels[dayIndex],
            active: recentActivity[6 - i] || false,
            isToday: i === 0
        });
    }

    const attendanceRate = totalDays > 0 ? Math.round((thisMonthDays / totalDays) * 100) : 0;

    return (
        <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    학습 연속 기록
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Streak */}
                <div className="flex items-center justify-center py-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Flame className={cn(
                                "w-8 h-8",
                                currentStreak > 0 ? "text-orange-500" : "text-slate-300"
                            )} />
                            <span className={cn(
                                "text-4xl font-bold",
                                currentStreak > 0 ? "text-orange-600" : "text-slate-400"
                            )}>
                                {currentStreak}
                            </span>
                            <span className="text-lg text-slate-500">일</span>
                        </div>
                        <p className="text-sm text-slate-500">연속 학습 중</p>
                    </div>
                </div>

                {/* Weekly Activity Dots */}
                <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-2 text-center">최근 7일</p>
                    <div className="flex justify-center gap-2">
                        {orderedDays.map((day, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                                    day.active
                                        ? "bg-green-500 text-white"
                                        : "bg-slate-200 text-slate-400",
                                    day.isToday && "ring-2 ring-blue-400 ring-offset-1"
                                )}>
                                    {day.active ? "✓" : day.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                        <Trophy className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-amber-700">{longestStreak}일</p>
                        <p className="text-xs text-amber-600">최장 기록</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <Calendar className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-blue-700">{thisMonthDays}일</p>
                        <p className="text-xs text-blue-600">이번 달 학습</p>
                    </div>
                </div>

                {/* Motivation Message */}
                <div className="text-center pt-2">
                    {currentStreak === 0 ? (
                        <p className="text-sm text-slate-500">오늘 학습을 시작해보세요! 🚀</p>
                    ) : currentStreak < 3 ? (
                        <p className="text-sm text-slate-500">좋은 시작이에요! 계속 이어가세요 💪</p>
                    ) : currentStreak < 7 ? (
                        <p className="text-sm text-green-600">대단해요! 일주일 연속 도전! 🔥</p>
                    ) : (
                        <p className="text-sm text-orange-600">놀라워요! 꾸준함의 달인! 🏆</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
