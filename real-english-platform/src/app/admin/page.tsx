"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Bell, BookOpen } from "lucide-react";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">관리자 대시보드</h1>
                <p className="text-slate-500 mt-2">오늘의 수업 현황과 학생 활동을 한눈에 확인하세요.</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">총 수강생</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4명</div>
                        <p className="text-xs text-slate-500 mt-1">+1명 (이번 달)</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">미채점 숙제</CardTitle>
                        <FileText className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">3개</div>
                        <p className="text-xs text-slate-500 mt-1">빠른 피드백이 필요해요!</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">오늘의 수업</CardTitle>
                        <BookOpen className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">2건</div>
                        <p className="text-xs text-slate-500 mt-1">오후 4시 / 오후 8시</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">읽지 않은 질문</CardTitle>
                        <Bell className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1건</div>
                        <p className="text-xs text-slate-500 mt-1">학생 Q&A 게시판</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity List */}
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>최근 활동 로그</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { text: "김철수 학생이 '단어 숙제'를 제출했습니다.", time: "10분 전", type: "submit" },
                            { text: "이영희 학생이 '모의고사 3회'를 완료했습니다.", time: "1시간 전", type: "exam" },
                            { text: "박지민 학생이 수강료를 입금했습니다. (확인 필요)", time: "3시간 전", type: "payment" },
                            { text: "최준호 학생에게 '듣기 과제' 피드백을 완료했습니다.", time: "어제", type: "feedback" },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${log.type === 'submit' ? 'bg-green-500' : log.type === 'payment' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                    <span className="text-sm text-slate-700">{log.text}</span>
                                </div>
                                <span className="text-xs text-slate-400">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
