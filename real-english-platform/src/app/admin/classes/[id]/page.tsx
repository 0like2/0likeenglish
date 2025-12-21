import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ManageLessonsForm from "@/components/admin/ManageLessonsForm";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

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

    // Fetch All Logs (Removed limit)
    const { data: lessonLogs } = await supabase
        .from('lesson_plans')
        .select(`
            *,
            exams ( title )
        `)
        .eq('class_id', id)
        .order('date', { ascending: false });

    // Fetch Active Exams
    const { data: exams } = await supabase
        .from('exams')
        .select('id, title, category')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

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
                                    ₩{classData.price?.toLocaleString() || 0}
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
                        <CardContent className="p-0">
                            {lessonLogs && lessonLogs.length > 0 ? (
                                <ScrollArea className="h-[600px] px-6 py-4">
                                    <Accordion type="single" collapsible className="w-full space-y-2">
                                        {lessonLogs.map((log) => (
                                            <AccordionItem key={log.id} value={log.id} className="border rounded-lg px-4 bg-white/50 hover:bg-white/80 transition-colors">
                                                <AccordionTrigger className="hover:no-underline py-4">
                                                    <div className="flex items-center justify-between w-full mr-4">
                                                        <div className="text-left">
                                                            <div className="font-bold text-slate-900">{log.title || 'Untitled'}</div>
                                                            <div className="text-sm text-slate-500 mt-0.5">{log.date}</div>
                                                        </div>
                                                        <Badge variant={log.status === 'upcoming' ? 'secondary' : 'default'} className="ml-2">
                                                            {log.status === 'upcoming' ? '예정' : '완료'}
                                                        </Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-2 pb-4 border-t mt-2">
                                                    {log.content && (
                                                        <div className="mb-4 bg-slate-50 p-3 rounded-md text-slate-700 text-sm whitespace-pre-wrap">
                                                            {log.content}
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                                        {log.vocab_hw && (
                                                            <div className="flex gap-2 items-start">
                                                                <span className="font-semibold text-slate-600 min-w-[60px]">단어:</span>
                                                                <span className="text-slate-800">{log.vocab_hw}</span>
                                                            </div>
                                                        )}
                                                        {log.listening_hw && (
                                                            <div className="flex gap-2 items-start">
                                                                <span className="font-semibold text-slate-600 min-w-[60px]">듣기:</span>
                                                                <span className="text-slate-800">{log.listening_hw}</span>
                                                            </div>
                                                        )}
                                                        {log.params?.exam_id || (log.exams as any)?.title && (
                                                            <div className="flex gap-2 items-start bg-blue-50 p-2 rounded text-blue-900">
                                                                <span className="font-semibold min-w-[60px]">모의고사:</span>
                                                                <span>{(log.exams as any)?.title}</span>
                                                            </div>
                                                        )}
                                                        {log.grammar_hw && (
                                                            <div className="flex gap-2 items-start">
                                                                <span className="font-semibold text-slate-600 min-w-[60px]">문법:</span>
                                                                <span className="text-slate-800">{log.grammar_hw}</span>
                                                            </div>
                                                        )}
                                                        {log.other_hw && (
                                                            <div className="flex gap-2 items-start">
                                                                <span className="font-semibold text-slate-600 min-w-[60px]">문제풀이:</span>
                                                                <span className="text-slate-800">{log.other_hw}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </ScrollArea>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
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
                                <ManageLessonsForm classId={id} className={classData.name} exams={exams || []} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
