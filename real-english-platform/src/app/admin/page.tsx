"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Bell, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

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

            {/* Data Restoration Section */}
            <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                    <CardTitle className="text-orange-900 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        데이터 복구 및 초기화
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-orange-800 mb-4">
                        학습자료실(블로그)이 비어있다면, 초기 예시 데이터(문법, 듣기, 공지사항 등)를 복구할 수 있습니다.
                    </p>
                    <Button
                        onClick={async () => {
                            if (!confirm('정말로 초기 데이터를 복구하시겠습니까?')) return;
                            const { seedBlogPosts } = await import('@/lib/actions/admin');
                            const result = await seedBlogPosts();
                            if (result.success) {
                                alert("데이터가 성공적으로 복구되었습니다!");
                                window.location.reload();
                            } else {
                                alert("복구 실패: " + result.message);
                            }
                        }}
                        variant="outline"
                        className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100 hover:text-orange-900"
                    >
                        학습자료실 예시 데이터 넣기
                    </Button>

                    <Button
                        onClick={async () => {
                            if (!confirm('학생 및 수업 데이터를 초기화하시겠습니까? (기존 데이터 유지, 중복 시 업데이트)')) return;
                            const { seedStudents } = await import('@/lib/actions/admin');
                            const result = await seedStudents();
                            if (result.success) {
                                alert("학생 데이터가 복구되었습니다!");
                                window.location.reload();
                            } else {
                                alert("복구 실패: " + result.message);
                            }
                        }}
                        variant="outline"
                        className="ml-2 bg-white border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-900"
                    >
                        학생 예시 데이터 넣기
                    </Button>
                </CardContent>
            </Card>

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
