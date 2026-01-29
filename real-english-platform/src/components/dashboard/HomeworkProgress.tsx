"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, AlertCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TodayHomeworkStatus {
    listening: { submitted: boolean; required: boolean };
    easy: { submitted: boolean; required: boolean };
    vocab: { submitted: boolean; required: boolean };
    homeworkDate: string;
    deadline: string;
    timeRemaining: string;
    isExpired: boolean;
}

interface MissedHomeworkSummary {
    listening: number;
    easy: number;
    vocab: number;
    total: number;
}

interface HomeworkProgressProps {
    quests: any[];
    todayStatus?: TodayHomeworkStatus;
    missedHomework?: MissedHomeworkSummary;
    classId?: string;
}

export default function HomeworkProgress({
    quests = [],
    todayStatus,
    missedHomework,
    classId
}: HomeworkProgressProps) {
    // 1. Calculate Total Percentage based on Frequency
    const totalGoal = quests.reduce((acc, q) => acc + (q.weekly_frequency || 1), 0);
    const totalDone = quests.reduce((acc, q) => acc + Math.min((q.current_count || 0), (q.weekly_frequency || 1)), 0);

    // Prevent division by zero
    const percentage = totalGoal > 0 ? Math.round((totalDone / totalGoal) * 100) : 0;

    // 오늘의 숙제 완료 개수 계산
    const todayTotal = [
        todayStatus?.listening.required,
        todayStatus?.easy.required,
        todayStatus?.vocab.required
    ].filter(Boolean).length;

    const todayCompleted = [
        todayStatus?.listening.required && todayStatus?.listening.submitted,
        todayStatus?.easy.required && todayStatus?.easy.submitted,
        todayStatus?.vocab.required && todayStatus?.vocab.submitted
    ].filter(Boolean).length;

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
            <CardContent className="space-y-4">
                {/* 놓친 숙제 경고 배너 */}
                {missedHomework && missedHomework.total > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-700">
                                놓친 숙제 {missedHomework.total}개
                            </p>
                            <p className="text-xs text-red-600 mt-0.5">
                                {missedHomework.listening > 0 && `듣기 ${missedHomework.listening}개`}
                                {missedHomework.listening > 0 && missedHomework.easy > 0 && ', '}
                                {missedHomework.easy > 0 && `쉬운문제 ${missedHomework.easy}개`}
                                {(missedHomework.listening > 0 || missedHomework.easy > 0) && missedHomework.vocab > 0 && ', '}
                                {missedHomework.vocab > 0 && `영단어 ${missedHomework.vocab}개`}
                            </p>
                        </div>
                    </div>
                )}

                {/* 오늘의 숙제 섹션 */}
                {todayStatus && todayTotal > 0 && (
                    <div className={cn(
                        "rounded-lg p-3 border",
                        todayStatus.isExpired
                            ? "bg-slate-50 border-slate-200"
                            : todayCompleted === todayTotal
                                ? "bg-green-50 border-green-200"
                                : "bg-blue-50 border-blue-200"
                    )}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Clock className={cn(
                                    "w-4 h-4",
                                    todayStatus.isExpired ? "text-slate-400" : "text-blue-500"
                                )} />
                                <span className="text-sm font-medium text-slate-700">
                                    오늘의 숙제
                                </span>
                            </div>
                            {!todayStatus.isExpired && (
                                <Badge variant="outline" className="text-xs bg-white">
                                    마감: {todayStatus.deadline}
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                            {todayStatus.listening.required && (
                                <div className={cn(
                                    "flex items-center gap-1.5 text-sm",
                                    todayStatus.listening.submitted ? "text-green-600" : "text-slate-600"
                                )}>
                                    {todayStatus.listening.submitted ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <Circle className="w-4 h-4" />
                                    )}
                                    <span>듣기</span>
                                </div>
                            )}
                            {todayStatus.easy.required && (
                                <div className={cn(
                                    "flex items-center gap-1.5 text-sm",
                                    todayStatus.easy.submitted ? "text-green-600" : "text-slate-600"
                                )}>
                                    {todayStatus.easy.submitted ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <Circle className="w-4 h-4" />
                                    )}
                                    <span>쉬운문제</span>
                                </div>
                            )}
                            {todayStatus.vocab.required && (
                                <div className={cn(
                                    "flex items-center gap-1.5 text-sm",
                                    todayStatus.vocab.submitted ? "text-green-600" : "text-slate-600"
                                )}>
                                    {todayStatus.vocab.submitted ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <Circle className="w-4 h-4" />
                                    )}
                                    <span>영단어</span>
                                </div>
                            )}
                        </div>

                        {!todayStatus.isExpired && todayCompleted < todayTotal && (
                            <p className="text-xs text-slate-500 mt-2">
                                남은 시간: {todayStatus.timeRemaining}
                            </p>
                        )}
                    </div>
                )}

                {/* 기존 퀘스트 목록 */}
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
                    <Link href={classId ? `/class/${classId}` : "/schedule"} className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1">
                        내 강의실에서 인증하기
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
