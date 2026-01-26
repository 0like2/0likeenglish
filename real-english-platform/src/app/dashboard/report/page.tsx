import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Target, BookOpen, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { getDetailedReportData } from "@/lib/data/report";
import ReportCharts from "@/components/dashboard/ReportCharts";

export const dynamic = 'force-dynamic';

export default async function ReportPage() {
    const data = await getDetailedReportData();

    if (!data) {
        return (
            <div className="min-h-screen bg-slate-50 py-8 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-slate-500">로그인이 필요합니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/dashboard" className="flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" />
                            돌아가기
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">학습 리포트 상세</h1>
                        <p className="text-slate-500 text-sm">{data.studentName}님의 학습 분석</p>
                    </div>
                </div>

                {/* 종합 통계 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        title="모의고사"
                        value={data.stats.mockCount > 0 ? `${data.stats.mockAvg}점` : '-'}
                        subtitle={`${data.stats.mockCount}회 응시`}
                        trend={data.stats.mockTrend}
                        icon={<BookOpen className="w-5 h-5" />}
                        color="purple"
                    />
                    <StatCard
                        title="듣기"
                        value={data.stats.listeningCount > 0 ? `${data.stats.listeningAvg}점` : '-'}
                        subtitle={`${data.stats.listeningCount}회 응시 / 17점 만점`}
                        trend={data.stats.listeningTrend}
                        icon={<BookOpen className="w-5 h-5" />}
                        color="blue"
                    />
                    <StatCard
                        title="쉬운문제"
                        value={data.stats.easyCount > 0 ? `${data.stats.easyAvg}점` : '-'}
                        subtitle={`${data.stats.easyCount}회 응시 / 10점 만점`}
                        trend={data.stats.easyTrend}
                        icon={<BookOpen className="w-5 h-5" />}
                        color="green"
                    />
                    <StatCard
                        title="단어 테스트"
                        value={`${data.stats.vocabPassRate}%`}
                        subtitle={`${data.stats.vocabPassCount}/${data.stats.vocabTotalCount} 통과`}
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        color="orange"
                    />
                </div>

                {/* 탭 컨텐츠 */}
                <Tabs defaultValue="scores" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="scores">성적 추이</TabsTrigger>
                        <TabsTrigger value="homework">숙제 현황</TabsTrigger>
                        <TabsTrigger value="quests">퀘스트</TabsTrigger>
                        <TabsTrigger value="weak">취약 분석</TabsTrigger>
                    </TabsList>

                    {/* 성적 추이 탭 */}
                    <TabsContent value="scores" className="space-y-6 mt-6">
                        <ReportCharts
                            mockTrend={data.mockTrend}
                            listeningTrend={data.listeningTrend}
                            easyTrend={data.easyTrend}
                        />

                        {/* 최근 시험 결과 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">최근 시험 결과</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.recentExams.length > 0 ? (
                                        data.recentExams.map((exam, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{exam.title}</p>
                                                    <p className="text-sm text-slate-500">{exam.date}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-purple-600">{exam.score}점</p>
                                                    <p className="text-xs text-slate-500">{exam.type}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 text-center py-4">시험 기록이 없습니다.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 숙제 현황 탭 */}
                    <TabsContent value="homework" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 이번주 숙제 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Target className="w-5 h-5 text-blue-500" />
                                        이번주 숙제
                                    </CardTitle>
                                    <CardDescription>
                                        {data.weeklyHomework.completed}/{data.weeklyHomework.total} 완료
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>완료율</span>
                                                <span className="font-medium">{data.weeklyHomework.rate}%</span>
                                            </div>
                                            <Progress value={data.weeklyHomework.rate} className="h-3" />
                                        </div>
                                        <div className="space-y-2">
                                            {data.weeklyHomeworkDetails.map((hw, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 rounded border">
                                                    <div className="flex items-center gap-2">
                                                        {hw.status === 'done' ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        ) : hw.status === 'failed' ? (
                                                            <XCircle className="w-4 h-4 text-red-500" />
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                                                        )}
                                                        <span className="text-sm">{hw.lessonDate} - {hw.type}</span>
                                                    </div>
                                                    <Badge variant={hw.status === 'done' ? 'default' : hw.status === 'failed' ? 'destructive' : 'secondary'}>
                                                        {hw.status === 'done' ? '완료' : hw.status === 'failed' ? '미완료' : '미확인'}
                                                    </Badge>
                                                </div>
                                            ))}
                                            {data.weeklyHomeworkDetails.length === 0 && (
                                                <p className="text-slate-400 text-center py-4">이번주 숙제가 없습니다.</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 이번달 숙제 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Target className="w-5 h-5 text-green-500" />
                                        이번달 숙제
                                    </CardTitle>
                                    <CardDescription>
                                        {data.monthlyHomework.completed}/{data.monthlyHomework.total} 완료
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>완료율</span>
                                                <span className="font-medium">{data.monthlyHomework.rate}%</span>
                                            </div>
                                            <Progress value={data.monthlyHomework.rate} className="h-3" />
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 text-center">
                                            <div className="p-2 bg-blue-50 rounded">
                                                <p className="text-lg font-bold text-blue-600">{data.homeworkByType.vocab.done}</p>
                                                <p className="text-xs text-slate-500">단어</p>
                                            </div>
                                            <div className="p-2 bg-green-50 rounded">
                                                <p className="text-lg font-bold text-green-600">{data.homeworkByType.listening.done}</p>
                                                <p className="text-xs text-slate-500">듣기</p>
                                            </div>
                                            <div className="p-2 bg-purple-50 rounded">
                                                <p className="text-lg font-bold text-purple-600">{data.homeworkByType.grammar.done}</p>
                                                <p className="text-xs text-slate-500">문법</p>
                                            </div>
                                            <div className="p-2 bg-orange-50 rounded">
                                                <p className="text-lg font-bold text-orange-600">{data.homeworkByType.other.done}</p>
                                                <p className="text-xs text-slate-500">기타</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 단어 테스트 결과 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">단어 테스트 결과</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {data.vocabTestResults.map((result, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg border ${result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                            <p className="text-sm font-medium">{result.lessonDate}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                {result.passed ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                )}
                                                <span className={`text-sm ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                    {result.passed ? '통과' : '불통과'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {data.vocabTestResults.length === 0 && (
                                        <p className="text-slate-400 col-span-4 text-center py-4">단어 테스트 기록이 없습니다.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 퀘스트 탭 */}
                    <TabsContent value="quests" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">학습 퀘스트 진행 현황</CardTitle>
                                <CardDescription>
                                    {data.questProgress.completed}/{data.questProgress.total} 퀘스트 완료
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <Progress value={data.questProgress.rate} className="h-3" />
                                    <div className="space-y-3">
                                        {data.quests.map((quest, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                        quest.status === 'completed' ? 'bg-green-100' :
                                                        quest.status === 'in_progress' ? 'bg-blue-100' : 'bg-slate-200'
                                                    }`}>
                                                        {quest.status === 'completed' ? (
                                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                        ) : (
                                                            <Target className="w-5 h-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{quest.title}</p>
                                                        <p className="text-sm text-slate-500">
                                                            주 {quest.targetCount}회 목표
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">{quest.currentCount}/{quest.targetCount}</p>
                                                    <Badge variant={
                                                        quest.status === 'completed' ? 'default' :
                                                        quest.status === 'in_progress' ? 'secondary' : 'outline'
                                                    }>
                                                        {quest.status === 'completed' ? '완료' :
                                                         quest.status === 'in_progress' ? '진행중' : '대기'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                        {data.quests.length === 0 && (
                                            <p className="text-slate-400 text-center py-4">활성화된 퀘스트가 없습니다.</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 취약 분석 탭 */}
                    <TabsContent value="weak" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <WeakPointCard
                                title="모의고사 취약 문제"
                                weakPoints={data.mockWeakPoints}
                                color="purple"
                            />
                            <WeakPointCard
                                title="듣기 취약 문제"
                                weakPoints={data.listeningWeakPoints}
                                color="blue"
                            />
                            <WeakPointCard
                                title="쉬운문제 취약 문제"
                                weakPoints={data.easyWeakPoints}
                                color="green"
                            />
                        </div>

                        {/* 학습 조언 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    학습 조언
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.suggestions.map((suggestion, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                            <span className="text-amber-500 font-bold">{idx + 1}.</span>
                                            <p className="text-sm text-slate-700">{suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    trend,
    icon,
    color
}: {
    title: string;
    value: string;
    subtitle: string;
    trend?: 'up' | 'down' | 'stable';
    icon: React.ReactNode;
    color: 'purple' | 'blue' | 'green' | 'orange';
}) {
    const colorClasses = {
        purple: 'bg-purple-50 border-purple-100',
        blue: 'bg-blue-50 border-blue-100',
        green: 'bg-green-50 border-green-100',
        orange: 'bg-orange-50 border-orange-100'
    };

    const iconColorClasses = {
        purple: 'text-purple-500',
        blue: 'text-blue-500',
        green: 'text-green-500',
        orange: 'text-orange-500'
    };

    return (
        <Card className={`${colorClasses[color]} border`}>
            <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                    <span className={iconColorClasses[color]}>{icon}</span>
                    {trend && (
                        <span className={trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}>
                            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                             trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                        </span>
                    )}
                </div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                <p className="text-sm font-medium text-slate-700 mt-2">{title}</p>
            </CardContent>
        </Card>
    );
}

function WeakPointCard({
    title,
    weakPoints,
    color
}: {
    title: string;
    weakPoints: { questionNumber: number; wrongRate: number; wrongCount: number; totalAttempts: number }[];
    color: 'purple' | 'blue' | 'green';
}) {
    const colorClasses = {
        purple: 'text-purple-600',
        blue: 'text-blue-600',
        green: 'text-green-600'
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className={`text-lg ${colorClasses[color]}`}>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {weakPoints.length > 0 ? (
                        weakPoints.slice(0, 5).map((wp, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                <span className="font-medium">{wp.questionNumber}번</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${wp.wrongRate >= 70 ? 'bg-red-500' : wp.wrongRate >= 50 ? 'bg-amber-500' : 'bg-yellow-500'}`}
                                            style={{ width: `${wp.wrongRate}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-600">{wp.wrongRate}%</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-center py-4 text-sm">취약 문제가 없습니다.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
