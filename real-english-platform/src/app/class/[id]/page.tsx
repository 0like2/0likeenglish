import { getClassInfo, getQuestProgress, getUserProfile } from "@/lib/data/dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import QuestSubmission from "@/components/class/QuestSubmission";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageProps {
    params: {
        id: string;
    };
}

export default async function ClassHomePage({ params }: PageProps) {
    const user = await getUserProfile();
    if (!user) redirect('/auth/login');

    const quests = await getQuestProgress(params.id, user.id);
    const classInfo = await getClassInfo(user.id); // Re-fetch to confirm access/name

    // Calculate overall stats
    const totalGoal = quests.reduce((acc, q) => acc + (q.weekly_frequency || 1), 0);
    const totalDone = quests.reduce((acc, q) => acc + Math.min((q.current_count || 0), (q.weekly_frequency || 1)), 0);
    const totalPercent = totalGoal > 0 ? Math.round((totalDone / totalGoal) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="w-6 h-6 text-slate-500" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {classInfo?.name || "내 강의실"}
                        </h1>
                        <p className="text-slate-500 text-sm">
                            이번 주 미션 달성률: <span className="text-blue-600 font-bold">{totalPercent}%</span>
                        </p>
                    </div>
                </div>

                {/* Quest List */}
                <div className="space-y-4">
                    {quests.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                            <p className="text-slate-400">등록된 숙제가 없습니다.</p>
                        </div>
                    ) : (
                        quests.map((quest) => {
                            const current = quest.current_count || 0;
                            const target = quest.weekly_frequency || 1;
                            const isDone = current >= target;

                            return (
                                <Card key={quest.id} className={cn("border transition-all", isDone ? "bg-slate-50 border-slate-200" : "bg-white border-blue-100 shadow-sm")}>
                                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-white">
                                                    {quest.type}
                                                </Badge>
                                                {isDone && (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                                        완료
                                                    </Badge>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className={cn("text-lg font-bold", isDone ? "text-slate-500 line-through" : "text-slate-900")}>
                                                    {quest.title}
                                                </h3>
                                                {quest.description && (
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {quest.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden max-w-[200px]">
                                                <div
                                                    className={cn("h-full transition-all", isDone ? "bg-green-500" : "bg-blue-500")}
                                                    style={{ width: `${Math.min((current / target) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                {current} / {target}회 완료
                                            </p>
                                        </div>

                                        {/* Action */}
                                        <div className="sm:w-40 flex-shrink-0">
                                            <QuestSubmission
                                                questId={quest.id}
                                                currentCount={current}
                                                targetCount={target}
                                                isCompleted={isDone}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
