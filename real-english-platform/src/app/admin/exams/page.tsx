import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, FileBarChart, BookOpen, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ExamListPage() {
    const supabase = await createClient();

    const { data: exams, error } = await supabase
        .from('class_exams')
        .select(`
            *,
            classes (
                name
            )
        `)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">모의고사 관리</h1>
                    <p className="text-slate-500 mt-1">등록된 시험의 정답을 관리하고 채점 결과를 확인하세요.</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/admin/exams/new">
                        <Plus className="mr-2 h-4 w-4" />
                        새 모의고사 등록
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams?.map((exam) => (
                    <Card key={exam.id} className="hover:shadow-md transition-shadow flex flex-col">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-2">
                                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                                    {(exam.classes as any)?.name || '공통'}
                                </Badge>
                                {/* <Badge className="bg-green-100 text-green-700 hover:bg-green-100">진행중</Badge> */}
                            </div>
                            <CardTitle className="text-lg mt-2 line-clamp-2 leading-tight">
                                {exam.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 pb-3">
                            <div className="flex items-center text-sm text-slate-500 gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(exam.created_at).toLocaleDateString()}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-3 border-t border-slate-100">
                            <Button variant="outline" className="w-full" asChild disabled>
                                {/* Disabled for now until results page is ready, or link to placeholder */}
                                <Link href={`/admin/exams/${exam.id}`}>
                                    <FileBarChart className="mr-2 h-4 w-4 text-slate-500" />
                                    결과 보기 (준비중)
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {(!exams || exams.length === 0) && (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
                        <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <p>등록된 모의고사가 없습니다.</p>
                        <Button variant="link" asChild className="mt-2 text-blue-600">
                            <Link href="/admin/exams/new">첫 모의고사 등록하기</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
