"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Lock, ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LearningPathProps {
    quests: any[];
}

export default function LearningPath({ quests = [] }: LearningPathProps) {
    return (
        <Card className="shadow-sm border-slate-100 col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    📝 이번 주 학습 퀘스트
                </CardTitle>
            </CardHeader>
            <CardContent>
                {quests.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        등록된 퀘스트가 없습니다.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {quests.map((quest, idx) => {
                            const isDone = quest.status === 'completed';
                            const isLocked = quest.status === 'locked';
                            const isCurrent = quest.status === 'in_progress' || quest.status === 'submitted';

                            return (
                                <div
                                    key={idx}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border transition-all",
                                        isCurrent ? "bg-white border-blue-200 shadow-md scale-[1.02]"
                                            : isDone ? "bg-green-50 border-green-100 opacity-80"
                                                : "bg-slate-50 border-slate-100 opacity-60"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center border-2",
                                            isDone ? "bg-green-100 border-green-200 text-green-600"
                                                : isCurrent ? "bg-blue-100 border-blue-200 text-blue-600 animate-pulse"
                                                    : "bg-slate-100 border-slate-200 text-slate-400"
                                        )}>
                                            {isDone ? <CheckCircle2 className="w-6 h-6" />
                                                : isLocked ? <Lock className="w-5 h-5" />
                                                    : <Circle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs font-normal bg-white/50">
                                                    {quest.type || "Quest"}
                                                </Badge>
                                                <span className="text-xs text-slate-400">
                                                    주 {quest.weekly_frequency || 1}회
                                                </span>
                                            </div>
                                            <h4 className={cn("font-bold", isCurrent ? "text-slate-900" : "text-slate-600")}>
                                                {quest.title}
                                            </h4>
                                        </div>
                                    </div>

                                    {isCurrent && (
                                        <Link href={`/blog/learning-method?topic=${quest.id}`}>
                                            <Badge className="bg-blue-600 hover:bg-blue-700 cursor-pointer pl-3 pr-2 py-1.5 transition-colors">
                                                학습법 보기 <ArrowRight className="w-3 h-3 ml-1" />
                                            </Badge>
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
