"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface ReportChartsProps {
    mockTrend: { name: string; score: number }[];
    listeningTrend: { name: string; score: number }[];
    easyTrend: { name: string; score: number }[];
}

export default function ReportCharts({ mockTrend, listeningTrend, easyTrend }: ReportChartsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">성적 추이 차트</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="mock" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="mock">모의고사</TabsTrigger>
                        <TabsTrigger value="listening">듣기</TabsTrigger>
                        <TabsTrigger value="easy">쉬운문제</TabsTrigger>
                    </TabsList>

                    <TabsContent value="mock" className="mt-4">
                        {mockTrend.length > 0 ? (
                            <ChartContainer data={mockTrend} color="#a855f7" maxScore={100} />
                        ) : (
                            <EmptyChart message="모의고사 응시 기록이 없습니다." />
                        )}
                    </TabsContent>

                    <TabsContent value="listening" className="mt-4">
                        {listeningTrend.length > 0 ? (
                            <ChartContainer data={listeningTrend} color="#3b82f6" maxScore={100} />
                        ) : (
                            <EmptyChart message="듣기 응시 기록이 없습니다." />
                        )}
                    </TabsContent>

                    <TabsContent value="easy" className="mt-4">
                        {easyTrend.length > 0 ? (
                            <ChartContainer data={easyTrend} color="#22c55e" maxScore={100} />
                        ) : (
                            <EmptyChart message="쉬운문제 응시 기록이 없습니다." />
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function ChartContainer({
    data,
    color,
    maxScore
}: {
    data: { name: string; score: number }[];
    color: string;
    maxScore: number;
}) {
    return (
        <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        domain={[0, maxScore]}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        width={35}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: number) => [`${value}점`, '점수']}
                    />
                    <ReferenceLine y={70} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke={color}
                        strokeWidth={2}
                        dot={{ fill: color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function EmptyChart({ message }: { message: string }) {
    return (
        <div className="h-[250px] flex items-center justify-center text-slate-400">
            {message}
        </div>
    );
}
