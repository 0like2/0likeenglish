"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockExamData = [
    { name: '9월', score: 78 },
    { name: '10월', score: 82 },
    { name: '11월', score: 85 },
    { name: '12월', score: 88 },
];

const listeningData = [
    { name: '1회', score: 18 },
    { name: '2회', score: 20 },
    { name: '3회', score: 22 },
    { name: '4회', score: 21 },
];

export default function MonthlyReport() {
    return (
        <Card className="shadow-sm border-slate-100 col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900">📊 월간 학습 리포트</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="mock" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="mock">모의고사 추이</TabsTrigger>
                        <TabsTrigger value="listening">듣기 성적</TabsTrigger>
                    </TabsList>


                    <TabsContent value="mock" className="h-[300px]">
                        {mockExamData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockExamData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                    <YAxis hide domain={[60, 100]} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                                모의고사 성적 데이터가 없습니다.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="listening" className="h-[300px]">
                        {listeningData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={listeningData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                    <YAxis hide domain={[0, 25]} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                                듣기 성적 데이터가 없습니다.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
