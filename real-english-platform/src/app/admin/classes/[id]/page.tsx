import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ManageLessonsForm from "@/components/admin/ManageLessonsForm";
import { Button } from "@/components/ui/button";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch Class Info
    const { data: classData, error } = await supabase
        .from('classes')
        .select('*, class_members(count)')
        .eq('id', id)
        .single();

    if (error || !classData) {
        notFound();
    }

    // Fetch Recent Logs
    const { data: lessonLogs } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('class_id', id)
        .order('date', { ascending: false })
        .limit(10);

    const studentCount = classData.class_members?.[0]?.count || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/classes">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">{classData.name}</h1>
                    <p className="text-slate-500">수업 코드를 관리하고 로그를 작성합니다.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Class Info & Logs (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium">수업 정보</CardTitle>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">수강중</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Clock className="w-4 h-4" />
                                    <span>{classData.schedule}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Users className="w-4 h-4" />
                                    <span>수강생 {studentCount}명</span>
                                </div>
                                <div className="col-span-2 text-slate-900 font-bold">
                                    ₩{classData.price.toLocaleString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lesson Logs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>최근 수업/숙제 로그</CardTitle>
                            <CardDescription>최근 등록된 10개의 수업 기록입니다.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {lessonLogs && lessonLogs.length > 0 ? (
                                lessonLogs.map((log) => (
                                    <div key={log.id} className="border rounded-lg p-4 space-y-2 bg-slate-50/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-slate-900">{log.title}</div>
                                                <div className="text-sm text-slate-500">{log.date}</div>
                                            </div>
                                            <Badge variant={log.status === 'upcoming' ? 'secondary' : 'default'}>
                                                {log.status === 'upcoming' ? '진행 예정' : '완료됨'}
                                            </Badge>
                                        </div>
                                        {log.content && (
                                            <p className="text-sm text-slate-700 bg-white p-3 rounded border">
                                                {log.content}
                                            </p>
                                        )}
                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-2">
                                            {log.vocab_hw && <div><span className="font-semibold text-red-500">단어:</span> {log.vocab_hw}</div>}
                                            {log.listening_hw && <div><span className="font-semibold text-purple-500">듣기:</span> {log.listening_hw}</div>}
                                            {log.grammar_hw && <div><span className="font-semibold text-indigo-500">문법:</span> {log.grammar_hw}</div>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    등록된 수업 로그가 없습니다.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Action Form (1/3 width) - Sticky */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <Card className="border-blue-200 shadow-md">
                            <CardContent className="pt-6">
                                <ManageLessonsForm classId={id} className={classData.name} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
