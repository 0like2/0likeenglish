"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface HomeworkProgressProps {
    quests: any[];
}

export default function HomeworkProgress({ quests = [] }: HomeworkProgressProps) {
    // 1. Calculate Total Percentage based on Frequency
    const totalGoal = quests.reduce((acc, q) => acc + (q.weekly_frequency || 1), 0);
    const totalDone = quests.reduce((acc, q) => acc + Math.min((q.current_count || 0), (q.weekly_frequency || 1)), 0);

    // Prevent division by zero
    const percentage = totalGoal > 0 ? Math.round((totalDone / totalGoal) * 100) : 0;

    return (
        <Card className="shadow-sm border-slate-100 bg-white md:col-span-1">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        이번 주 미션 ({totalDone}/{totalGoal}회)
                    </CardTitle>
                    <Badge variant={percentage >= 100 ? "default" : "secondary"} className="font-normal">
                        {percentage}% 달성
                    </Badge>
                </div>
                <Progress value={percentage} className="h-2 mt-2 bg-slate-100" indicatorClassName={percentage >= 100 ? "bg-green-500" : "bg-blue-600"} />
            </CardHeader>
            <CardContent>
                {quests.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                        등록된 이번 주 숙제가 없습니다.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {quests.map((quest, idx) => {
                            const current = quest.current_count || 0;
                            const target = quest.weekly_frequency || 1;
                            const isDone = current >= target;

                            return (
                                <div key={idx} className={cn(
                                    "flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-slate-50",
                                    isDone ? "opacity-75" : ""
                                )}>
                                    <div className="mt-0.5">
                                        {isDone ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className={cn("text-sm font-medium", isDone ? "text-slate-500 line-through" : "text-slate-900")}>
                                                {quest.title}
                                            </h4>
                                            <Badge variant="outline" className={cn(
                                                "text-[10px] px-1.5 py-0 border-slate-200",
                                                isDone ? "bg-green-50 text-green-600 border-green-200" : "bg-slate-50 text-slate-500"
                                            )}>
                                                {current}/{target}회
                                            </Badge>
                                        </div>
                                        {quest.description && !isDone && (
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                                {quest.description}
                                            </p>
                                        )}
                                        {/* Mini progress bar for this specific task */}
                                        {!isDone && target > 1 && (
                                            <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-400 rounded-full transition-all"
                                                    style={{ width: `${(current / target) * 100}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-50 text-center">
                    <Link href="/dashboard" className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1">
                        내 강의실에서 인증하기
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

