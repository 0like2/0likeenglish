"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";
import type { ScoreTrendItem, WeakPoint } from "@/lib/data/analytics";

interface StudentAnalyticsProps {
    listeningTrend: ScoreTrendItem[];
    easyTrend: ScoreTrendItem[];
    mockTrend: ScoreTrendItem[];
    listeningWeakPoints: WeakPoint[];
    easyWeakPoints: WeakPoint[];
    mockWeakPoints: WeakPoint[];
}

export default function StudentAnalytics({
    listeningTrend,
    easyTrend,
    mockTrend,
    listeningWeakPoints,
    easyWeakPoints,
    mockWeakPoints
}: StudentAnalyticsProps) {
    const [activeTab, setActiveTab] = useState("listening");

    const getTrendData = () => {
        switch (activeTab) {
            case "listening":
                return listeningTrend;
            case "easy":
                return easyTrend;
            case "mock":
                return mockTrend;
            default:
                return [];
        }
    };

    const getWeakPoints = () => {
        switch (activeTab) {
            case "listening":
                return listeningWeakPoints;
            case "easy":
                return easyWeakPoints;
            case "mock":
                return mockWeakPoints;
            default:
                return [];
        }
    };

    const getChartColor = () => {
        switch (activeTab) {
            case "listening":
                return "#3b82f6"; // blue
            case "easy":
                return "#22c55e"; // green
            case "mock":
                return "#a855f7"; // purple
            default:
                return "#3b82f6";
        }
    };

    const getQuestionLabel = () => {
        switch (activeTab) {
            case "listening":
                return "듣기";
            case "easy":
                return "쉬운문제";
            case "mock":
                return "모의고사";
            default:
                return "";
        }
    };

    const trendData = getTrendData();
    const weakPoints = getWeakPoints();

    return (
        <div className="space-y-6">
            {/* Score Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>성적 추이</CardTitle>
                    <CardDescription>유형별 성적 변화 추이를 확인합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="listening" className="gap-1">
                                듣기
                                <Badge variant="secondary" className="ml-1">{listeningTrend.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="easy" className="gap-1">
                                쉬운문제
                                <Badge variant="secondary" className="ml-1">{easyTrend.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="mock" className="gap-1">
                                모의고사
                                <Badge variant="secondary" className="ml-1">{mockTrend.length}</Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-0">
                            {trendData.length > 0 ? (
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={trendData}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis
                                                dataKey="label"
                                                tick={{ fontSize: 12 }}
                                                tickLine={false}
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis
                                                domain={[0, 100]}
                                                tick={{ fontSize: 12 }}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px'
                                                }}
                                                formatter={(value: number) => [`${value}점`, '점수']}
                                            />
                                            <ReferenceLine y={70} stroke="#94a3b8" strokeDasharray="3 3" label="70점" />
                                            <Line
                                                type="monotone"
                                                dataKey="score"
                                                stroke={getChartColor()}
                                                strokeWidth={2}
                                                dot={{ fill: getChartColor(), strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-slate-400">
                                    {getQuestionLabel()} 응시 기록이 없습니다.
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Weak Points */}
            <Card>
                <CardHeader>
                    <CardTitle>취약 문제 분석</CardTitle>
                    <CardDescription>
                        자주 틀리는 문제 번호입니다. (최소 2회 이상 응시한 문제 기준)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {weakPoints.length > 0 ? (
                        <div className="space-y-3">
                            {weakPoints.map((wp) => (
                                <div
                                    key={wp.questionNumber}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border font-bold text-slate-700">
                                            {wp.questionNumber}
                                        </span>
                                        <div>
                                            <p className="text-sm text-slate-600">
                                                {getQuestionLabel()} {wp.questionNumber}번
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {wp.totalAttempts}회 응시 중 {wp.wrongCount}회 오답
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-400 rounded-full"
                                                style={{ width: `${wp.wrongRate}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-semibold ${
                                            wp.wrongRate >= 70 ? 'text-red-600' :
                                            wp.wrongRate >= 50 ? 'text-orange-600' :
                                            'text-yellow-600'
                                        }`}>
                                            {wp.wrongRate}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-slate-400">
                            {trendData.length > 0
                                ? '분석할 취약 문제가 없습니다.'
                                : `${getQuestionLabel()} 응시 기록이 없습니다.`}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
