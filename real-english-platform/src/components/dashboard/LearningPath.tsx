"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock Data
const QUESTS = [
    { id: "class-3", title: "Chapter 12. 수동태 정복", date: "12/16", status: "current", type: "Main Quest" },
    { id: "class-1", title: "Chapter 13. 가정법의 이해", date: "12/18", status: "locked", type: "Main Quest" },
    { id: "hw-prev", title: "Chapter 11. 관계사 복습", date: "12/14", status: "completed", type: "Completed" },
];

export default function LearningPath() {
    return (
        <Card className="shadow-sm border-slate-100 col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    🗺️ 학습 퀘스트 (Learning Path)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {QUESTS.map((quest, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border transition-all",
                                quest.status === 'current' ? "bg-white border-blue-200 shadow-md scale-[1.02]"
                                    : quest.status === 'completed' ? "bg-slate-50 border-slate-100 opacity-70"
                                        : "bg-slate-50 border-slate-100 opacity-50"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2",
                                    quest.status === 'completed' ? "bg-green-100 border-green-200 text-green-600"
                                        : quest.status === 'current' ? "bg-blue-100 border-blue-200 text-blue-600 animate-pulse"
                                            : "bg-slate-100 border-slate-200 text-slate-400"
                                )}>
                                    {quest.status === 'completed' ? <CheckCircle2 className="w-6 h-6" />
                                        : quest.status === 'locked' ? <Lock className="w-5 h-5" />
                                            : <Circle className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {quest.type}
                                        </Badge>
                                        <span className="text-xs text-slate-400">{quest.date}</span>
                                    </div>
                                    <h4 className={cn("font-bold", quest.status === 'current' ? "text-slate-900" : "text-slate-600")}>
                                        {quest.title}
                                    </h4>
                                </div>
                            </div>

                            {quest.status === 'current' && (
                                <Link href={`/class/${quest.id}/2025-12-16`}>
                                    <Badge className="bg-blue-600 hover:bg-blue-700 cursor-pointer pl-3 pr-2 py-1.5">
                                        입장하기 <ArrowRight className="w-3 h-3 ml-1" />
                                    </Badge>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
