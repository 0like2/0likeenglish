import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, School, Calendar, BookOpen, Headphones, FileText } from "lucide-react";
import Link from "next/link";
import {
    getStudentInfo,
    getStudentStats,
    getScoreTrend,
    getHomeworkCompletionRate,
    getWeakPoints
} from "@/lib/data/analytics";
import StudentAnalytics from "@/components/admin/StudentAnalytics";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: PageProps) {
    const { id } = await params;

    const studentInfo = await getStudentInfo(id);
    if (!studentInfo) {
        notFound();
    }

    const [
        stats,
        listeningTrend,
        easyTrend,
        mockTrend,
        weeklyCompletion,
        monthlyCompletion,
        listeningWeakPoints,
        easyWeakPoints,
        mockWeakPoints
    ] = await Promise.all([
        getStudentStats(id),
        getScoreTrend(id, 'listening', 20),
        getScoreTrend(id, 'easy', 20),
        getScoreTrend(id, 'mock', 20),
        getHomeworkCompletionRate(id, 'week'),
        getHomeworkCompletionRate(id, 'month'),
        getWeakPoints(id, 'listening'),
        getWeakPoints(id, 'easy'),
        getWeakPoints(id, 'mock')
    ]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/students">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">{studentInfo.name}</h1>
                    <p className="text-slate-500">학생 상세 분석</p>
                </div>
            </div>

            {/* Basic Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        기본 정보
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                            <School className="w-4 h-4" />
                            <span>{studentInfo.school || '학교 정보 없음'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <BookOpen className="w-4 h-4" />
                            <span>{studentInfo.className || '미배정'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span>가입: {new Date(studentInfo.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                        <div className="text-slate-500">
                            {studentInfo.email}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Headphones className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">듣기 평균</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.listeningAvg}점</p>
                                <p className="text-xs text-slate-400">{stats.listeningCount}회 응시</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <BookOpen className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">쉬운문제 평균</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.easyAvg}점</p>
                                <p className="text-xs text-slate-400">{stats.easyCount}회 응시</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">모의고사 평균</p>
                                <p className="text-2xl font-bold text-slate-900">{stats.mockAvg}점</p>
                                <p className="text-xs text-slate-400">{stats.mockCount}회 응시</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <BookOpen className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">단어 테스트</p>
                                <div className="flex gap-2 items-center">
                                    <Badge className="bg-green-100 text-green-700">{stats.vocabTestPassCount} Pass</Badge>
                                    <Badge className="bg-red-100 text-red-700">{stats.vocabTestFailCount} Fail</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Homework Completion */}
            <Card>
                <CardHeader>
                    <CardTitle>숙제 완료율</CardTitle>
                    <CardDescription>주간 및 월간 숙제 완료 현황입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">주간 완료율</span>
                                <span className="font-semibold">{weeklyCompletion.rate}%</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all"
                                    style={{ width: `${weeklyCompletion.rate}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400">
                                {weeklyCompletion.completed} / {weeklyCompletion.total} 완료
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">월간 완료율</span>
                                <span className="font-semibold">{monthlyCompletion.rate}%</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all"
                                    style={{ width: `${monthlyCompletion.rate}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-400">
                                {monthlyCompletion.completed} / {monthlyCompletion.total} 완료
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Analytics Component (Charts & Weak Points) */}
            <StudentAnalytics
                listeningTrend={listeningTrend}
                easyTrend={easyTrend}
                mockTrend={mockTrend}
                listeningWeakPoints={listeningWeakPoints}
                easyWeakPoints={easyWeakPoints}
                mockWeakPoints={mockWeakPoints}
            />
        </div>
    );
}
