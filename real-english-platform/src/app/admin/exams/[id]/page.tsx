import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Assuming standard table HTML if no component
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, User } from "lucide-react";

export default async function ExamResultPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    // 1. Fetch Exam Info
    const { data: exam } = await supabase
        .from('class_exams')
        .select('*, classes(name)')
        .eq('id', params.id)
        .single();

    // 2. Fetch Submissions
    const { data: submissions } = await supabase
        .from('exam_submissions')
        .select(`
            *,
            users (
                name,
                email
            )
        `)
        .eq('exam_id', params.id)
        .order('score', { ascending: false });

    // Calculate Stats
    const totalStudents = submissions?.length || 0;
    const avgScore = totalStudents > 0
        ? Math.round(submissions!.reduce((acc, sub) => acc + sub.score, 0) / totalStudents)
        : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/exams">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{exam?.title}</h1>
                        <Badge>{(exam?.classes as any)?.name}</Badge>
                    </div>
                    <p className="text-slate-500 mt-1">응시자 {totalStudents}명 • 평균 {avgScore}점</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Summary Cards */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">평균 점수</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgScore}점</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">최고 점수</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {submissions && submissions.length > 0 ? Math.max(...submissions.map(s => s.score)) : 0}점
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">응시 인원</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}명</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>학생별 성적 리스트</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">이름</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">점수</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">제출 시간</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">상태</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {submissions?.map((submission) => (
                                    <tr key={submission.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <div className="font-medium">{(submission.users as any)?.name}</div>
                                                <div className="text-xs text-slate-400">{(submission.users as any)?.email}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle font-bold text-lg">
                                            {submission.score}점
                                        </td>
                                        <td className="p-4 align-middle text-slate-500">
                                            {new Date(submission.created_at).toLocaleString()}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                채점 완료
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {(!submissions || submissions.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500">
                                            아직 제출된 답안이 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
