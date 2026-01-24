
import { getQuestProgress, getUserProfile } from "@/lib/data/dashboard";
import { getClassLessons, getStudentLessonChecks, getClassDetails } from "@/lib/data/class";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft, Calendar, FileText, BookOpen, Headphones, PenTool, ClipboardCheck, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import QuestSubmission from "@/components/class/QuestSubmission";
import HomeworkCheckItem from "@/components/class/HomeworkCheckItem";
import { redirect, notFound } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ClassHomePage({ params }: PageProps) {
    const { id } = await params;
    const user = await getUserProfile();
    if (!user) redirect('/auth/login');

    const classInfo = await getClassDetails(id);
    if (!classInfo) return <div className="p-8 text-center font-bold text-xl">수업 정보를 찾을 수 없습니다.<br /><Link href="/schedule"><Button className="mt-4">시간표로 돌아가기</Button></Link></div>;

    const quests = await getQuestProgress(id, user.id);
    const lessons = await getClassLessons(id);
    const checks = await getStudentLessonChecks(user.id, id);

    // Calculate overall stats
    const totalGoal = quests.reduce((acc, q) => acc + (q.weekly_frequency || 1), 0);
    const totalDone = quests.reduce((acc, q) => acc + Math.min((q.current_count || 0), (q.weekly_frequency || 1)), 0);
    const totalPercent = totalGoal > 0 ? Math.round((totalDone / totalGoal) * 100) : 0;

    // Get most recent lesson for homework content display
    const mostRecentLesson = lessons.length > 0 ? lessons[0] : null;

    // Helper function to get quest icon and color
    const getQuestStyle = (questType: string) => {
        const type = questType?.toLowerCase() || '';
        if (type.includes('단어') || type.includes('vocab')) {
            return { icon: BookOpen, color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
        }
        if (type.includes('듣기') || type.includes('listen')) {
            return { icon: Headphones, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' };
        }
        if (type.includes('모의') || type.includes('mock') || type.includes('exam')) {
            return { icon: ClipboardCheck, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
        }
        if (type.includes('문법') || type.includes('grammar')) {
            return { icon: PenTool, color: 'text-indigo-500', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' };
        }
        return { icon: CheckCircle2, color: 'text-slate-500', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' };
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 pb-20">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
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

                {/* 1. 금주의 퀘스트 - Shows homework content from lesson log */}
                <section className="space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        금주의 퀘스트 (Weekly Quest)
                    </h2>

                    {!mostRecentLesson ? (
                        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-200">
                            <p className="text-slate-400">등록된 숙제가 없습니다.</p>
                        </div>
                    ) : (
                        <Card className="border bg-white">
                            <div className="p-4 sm:p-6 space-y-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>{mostRecentLesson.date} 수업 기준</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {mostRecentLesson.vocab_hw && (
                                        <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                            <BookOpen className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-red-700">단어 (Vocabulary)</p>
                                                <p className="text-sm text-slate-700">{mostRecentLesson.vocab_hw}</p>
                                            </div>
                                        </div>
                                    )}
                                    {mostRecentLesson.listening_hw && (
                                        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                            <Headphones className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-purple-700">듣기 (Listening)</p>
                                                <p className="text-sm text-slate-700">{mostRecentLesson.listening_hw}</p>
                                            </div>
                                        </div>
                                    )}
                                    {mostRecentLesson.grammar_hw && (
                                        <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                            <PenTool className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-indigo-700">문법 (Grammar)</p>
                                                <p className="text-sm text-slate-700">{mostRecentLesson.grammar_hw}</p>
                                            </div>
                                        </div>
                                    )}
                                    {mostRecentLesson.other_hw && (
                                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                            <FileText className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">기타 (Other)</p>
                                                <p className="text-sm text-slate-700">{mostRecentLesson.other_hw}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {!mostRecentLesson.vocab_hw && !mostRecentLesson.listening_hw &&
                                 !mostRecentLesson.grammar_hw && !mostRecentLesson.other_hw && (
                                    <p className="text-slate-400 text-center py-4">이번 주 숙제 내용이 없습니다.</p>
                                )}
                            </div>
                        </Card>
                    )}
                </section>

                {/* 2. 숙제 제출하기 - Submission buttons with progress */}
                <section className="space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Send className="w-5 h-5 text-green-600" />
                        숙제 제출하기
                    </h2>

                    {quests.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-200">
                            <p className="text-slate-400">등록된 퀘스트가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {quests.map((quest) => {
                                const current = quest.current_count || 0;
                                const target = quest.weekly_frequency || 1;
                                const isDone = current >= target;
                                const style = getQuestStyle(quest.type || quest.title);
                                const IconComponent = style.icon;

                                return (
                                    <Card key={quest.id} className={cn(
                                        "border transition-all overflow-hidden",
                                        isDone ? "bg-green-50 border-green-200" : `${style.bgColor} ${style.borderColor}`
                                    )}>
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <IconComponent className={cn("w-5 h-5", isDone ? "text-green-600" : style.color)} />
                                                    <h3 className={cn(
                                                        "font-bold",
                                                        isDone ? "text-green-700" : "text-slate-900"
                                                    )}>
                                                        {quest.title}
                                                    </h3>
                                                </div>
                                                {isDone && (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-xs">
                                                        완료
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full transition-all", isDone ? "bg-green-500" : "bg-blue-500")}
                                                        style={{ width: `${Math.min((current / target) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    {current} / {target}회 완료
                                                </p>
                                            </div>

                                            <QuestSubmission
                                                questId={quest.id}
                                                questType={quest.type || quest.title}
                                                currentCount={current}
                                                targetCount={target}
                                                isCompleted={isDone}
                                            />
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* 3. Lesson Log */}
                <section className="space-y-4 pt-4 border-t border-slate-200">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-700" />
                        수업 및 숙제 로그 (Lesson Log)
                    </h2>

                    <div className="space-y-4">
                        {lessons.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-400">아직 등록된 수업 로그가 없습니다.</p>
                            </div>
                        ) : (
                            lessons.map((lesson) => {
                                const check = checks.find(c => c.lesson_id === lesson.id);
                                return (
                                    <Card key={lesson.id} className="overflow-hidden border-l-4 border-l-blue-500">
                                        <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                                                    <Calendar className="w-4 h-4" />
                                                    {lesson.date}
                                                </div>
                                                <h3 className="font-bold text-slate-800">{lesson.title || "수업 내용"}</h3>
                                            </div>
                                            <Badge variant={lesson.status === 'completed' ? "secondary" : "default"} className={lesson.status === 'completed' ? "bg-slate-200 text-slate-600" : "bg-blue-600"}>
                                                {lesson.status === 'completed' ? '완료됨' : '진행중'}
                                            </Badge>
                                        </div>
                                        <div className="p-4 sm:p-6 space-y-4">
                                            {/* Main Content */}
                                            {lesson.content && (
                                                <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
                                                    {lesson.content}
                                                </div>
                                            )}

                                            {/* Homework Grid with Interaction */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {lesson.vocab_hw && (
                                                    <HomeworkCheckItem
                                                        lessonId={lesson.id}
                                                        field="vocab_status"
                                                        label="단어 (Vocabulary)"
                                                        content={lesson.vocab_hw}
                                                        status={check?.vocab_status || 'none'}
                                                        iconColor="text-red-500"
                                                        iconType="BookOpen"
                                                    />
                                                )}
                                                {lesson.listening_hw && (
                                                    <HomeworkCheckItem
                                                        lessonId={lesson.id}
                                                        field="listening_status"
                                                        label="듣기 (Listening)"
                                                        content={lesson.listening_hw}
                                                        status={check?.listening_status || 'none'}
                                                        iconColor="text-purple-500"
                                                        iconType="Headphones"
                                                    />
                                                )}
                                                {lesson.grammar_hw && (
                                                    <HomeworkCheckItem
                                                        lessonId={lesson.id}
                                                        field="grammar_status"
                                                        label="문법 (Grammar)"
                                                        content={lesson.grammar_hw}
                                                        status={check?.grammar_status || 'none'}
                                                        iconColor="text-indigo-500"
                                                        iconType="PenTool"
                                                    />
                                                )}
                                                {lesson.other_hw && (
                                                    <HomeworkCheckItem
                                                        lessonId={lesson.id}
                                                        field="other_status"
                                                        label="그 외 (Other)"
                                                        content={lesson.other_hw}
                                                        status={check?.other_status || 'none'}
                                                        iconColor="text-slate-500"
                                                        iconType="CheckCircle2"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
