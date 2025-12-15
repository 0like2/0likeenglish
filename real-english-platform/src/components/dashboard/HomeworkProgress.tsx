"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star } from "lucide-react";

interface HomeworkProgressProps {
    completed: number;
    total: number;
    streakDays: number;
}

export default function HomeworkProgress({ completed, total, streakDays }: HomeworkProgressProps) {
    const safeTotal = total > 0 ? total : 1;
    const percentage = Math.round((completed / safeTotal) * 100);

    return (
        <Card className="shadow-sm border-slate-100 bg-gradient-to-br from-white to-blue-50/50">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">이번 주 미션</CardTitle>
                    <div className="flex items-center text-amber-500 font-bold text-sm bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                        <span className="mr-1">🔥</span> {streakDays}일 연속!
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-3xl font-bold text-slate-900 leading-none">
                                {percentage}%
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {total - completed}개만 더 하면 완료해요!
                            </p>
                        </div>
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            {percentage >= 100 ? <Trophy className="w-6 h-6" /> : <Star className="w-6 h-6" />}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Progress value={percentage} className="h-2 bg-blue-100" />
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>0</span>
                            <span>Goal: {total}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
