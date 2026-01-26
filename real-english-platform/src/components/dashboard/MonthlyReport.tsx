"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { ChevronRight, TrendingUp, CheckCircle2, BookOpen, Target } from "lucide-react";

interface ReportData {
    mockTrend: { name: string; score: number; label: string }[];
    listeningTrend: { name: string; score: number; label: string }[];
    easyTrend: { name: string; score: number; label: string }[];
    weeklyHomework: { total: number; completed: number; rate: number };
    monthlyHomework: { total: number; completed: number; rate: number };
    questProgress: { total: number; completed: number; rate: number };
    stats: {
        mockAvg: number;
        mockCount: number;
        listeningAvg: number;
        listeningCount: number;
        easyAvg: number;
        easyCount: number;
        vocabPassRate: number;
    };
}

interface MonthlyReportProps {
    data?: ReportData | null;
}

export default function MonthlyReport({ data }: MonthlyReportProps) {
    const hasData = data && (data.mockTrend.length > 0 || data.listeningTrend.length > 0 || data.easyTrend.length > 0);

    return (
        <Card className="shadow-sm border-slate-100 col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        월간 학습 리포트
                    </span>
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    <Link href="/dashboard/report" className="flex items-center gap-1">
                        자세히 보기
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* 요약 통계 카드 */}
                {data && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <SummaryCard
                            icon={<Target className="w-4 h-4" />}
                            label="이번주 숙제"
                            value={`${data.weeklyHomework.rate}%`}
                            subtext={`${data.weeklyHomework.completed}/${data.weeklyHomework.total} 완료`}
                            color="blue"
                        />
                        <SummaryCard
                            icon={<CheckCircle2 className="w-4 h-4" />}
                            label="퀘스트 진행"
                            value={`${data.questProgress.rate}%`}
                            subtext={`${data.questProgress.completed}/${data.questProgress.total} 달성`}
                            color="green"
                        />
                        <SummaryCard
                            icon={<BookOpen className="w-4 h-4" />}
                            label="모의고사 평균"
                            value={data.stats.mockCount > 0 ? `${data.stats.mockAvg}점` : '-'}
                            subtext={data.stats.mockCount > 0 ? `${data.stats.mockCount}회 응시` : '응시 기록 없음'}
                            color="purple"
                        />
                        <SummaryCard
                            icon={<BookOpen className="w-4 h-4" />}
                            label="단어 테스트"
                            value={`${data.stats.vocabPassRate}%`}
                            subtext="통과율"
                            color="orange"
                        />
                    </div>
                )}

                {/* 성적 추이 차트 */}
                <Tabs defaultValue="mock" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="mock" className="text-xs md:text-sm">
                            모의고사 ({data?.mockTrend.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="listening" className="text-xs md:text-sm">
                            듣기 ({data?.listeningTrend.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="easy" className="text-xs md:text-sm">
                            쉬운문제 ({data?.easyTrend.length || 0})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="mock" className="h-[250px]">
                        {data && data.mockTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <AreaChart data={data.mockTrend}>
                                    <defs>
                                        <linearGradient id="colorMock" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-3 rounded-lg shadow-lg border">
                                                        <p className="font-medium text-slate-900">{data.label}</p>
                                                        <p className="text-purple-600 font-bold">{data.score}점</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorMock)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="모의고사 응시 기록이 없습니다." />
                        )}
                    </TabsContent>

                    <TabsContent value="listening" className="h-[250px]">
                        {data && data.listeningTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <BarChart data={data.listeningTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis hide domain={[0, 17]} />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-3 rounded-lg shadow-lg border">
                                                        <p className="font-medium text-slate-900">{data.label}</p>
                                                        <p className="text-blue-600 font-bold">{data.score}/17점</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="듣기 테스트 기록이 없습니다." />
                        )}
                    </TabsContent>

                    <TabsContent value="easy" className="h-[250px]">
                        {data && data.easyTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <BarChart data={data.easyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis hide domain={[0, 10]} />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-3 rounded-lg shadow-lg border">
                                                        <p className="font-medium text-slate-900">{data.label}</p>
                                                        <p className="text-green-600 font-bold">{data.score}/10점</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="score" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="쉬운문제 테스트 기록이 없습니다." />
                        )}
                    </TabsContent>
                </Tabs>

                {/* 숙제 완료 현황 */}
                {data && (
                    <div className="space-y-3 pt-2 border-t">
                        <h4 className="text-sm font-medium text-slate-700">숙제 완료 현황</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">이번주</span>
                                    <span className="font-medium">{data.weeklyHomework.rate}%</span>
                                </div>
                                <Progress value={data.weeklyHomework.rate} className="h-2" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">이번달</span>
                                    <span className="font-medium">{data.monthlyHomework.rate}%</span>
                                </div>
                                <Progress value={data.monthlyHomework.rate} className="h-2" />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function SummaryCard({
    icon,
    label,
    value,
    subtext,
    color
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtext: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
}) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100'
    };

    return (
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
            <div className="flex items-center gap-1.5 mb-1">
                {icon}
                <span className="text-xs font-medium opacity-80">{label}</span>
            </div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs opacity-70">{subtext}</p>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex h-full items-center justify-center text-slate-400">
            <div className="text-center">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>{message}</p>
                <p className="text-sm mt-1">테스트를 응시하면 여기에 기록됩니다.</p>
            </div>
        </div>
    );
}
