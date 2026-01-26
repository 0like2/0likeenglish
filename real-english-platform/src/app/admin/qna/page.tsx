import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getQuestions } from "@/lib/actions/qna";
import QnAAnswerForm from "@/components/admin/QnAAnswerForm";
import QnADeleteButton from "@/components/admin/QnADeleteButton";
import { MessageSquare, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function AdminQnAPage() {
    const questions = await getQuestions();

    const unanswered = questions.filter((q: any) => !q.answer);
    const answered = questions.filter((q: any) => q.answer);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">문의 관리</h1>
                <p className="text-slate-500 mt-2">학생들의 질문을 확인하고 답변합니다.</p>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{questions.length}</p>
                            <p className="text-sm text-slate-500">전체 문의</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{unanswered.length}</p>
                            <p className="text-sm text-slate-500">답변 대기</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{answered.length}</p>
                            <p className="text-sm text-slate-500">답변 완료</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 답변 대기 목록 */}
            {unanswered.length > 0 && (
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" />
                            답변 대기 ({unanswered.length}건)
                        </CardTitle>
                        <CardDescription>아직 답변하지 않은 질문입니다.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {unanswered.map((q: any) => (
                            <div key={q.id} className="border border-amber-200 bg-amber-50/50 rounded-lg p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{q.title}</h3>
                                        <p className="text-sm text-slate-500">
                                            {q.student?.name || '익명'} · {format(new Date(q.created_at), 'M월 d일 HH:mm', { locale: ko })}
                                        </p>
                                    </div>
                                    <Badge className="bg-amber-100 text-amber-700 border-0">대기중</Badge>
                                </div>
                                <p className="text-slate-700 whitespace-pre-wrap">{q.content}</p>
                                <QnAAnswerForm questionId={q.id} />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* 답변 완료 목록 */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        답변 완료 ({answered.length}건)
                    </CardTitle>
                    <CardDescription>답변이 완료된 질문입니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {answered.length === 0 ? (
                        <p className="text-center py-8 text-slate-500">답변 완료된 질문이 없습니다.</p>
                    ) : (
                        answered.map((q: any) => (
                            <div key={q.id} className="border border-slate-200 bg-white rounded-lg p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{q.title}</h3>
                                        <p className="text-sm text-slate-500">
                                            {q.student?.name || '익명'} · {format(new Date(q.created_at), 'M월 d일 HH:mm', { locale: ko })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-100 text-green-700 border-0">완료</Badge>
                                        <QnADeleteButton questionId={q.id} title={q.title} />
                                    </div>
                                </div>
                                <p className="text-slate-700 whitespace-pre-wrap">{q.content}</p>
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                    <p className="text-sm font-medium text-blue-800 mb-1">선생님 답변:</p>
                                    <p className="text-blue-700 whitespace-pre-wrap">{q.answer}</p>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
