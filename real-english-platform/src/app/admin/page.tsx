import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Bell, BookOpen } from "lucide-react";
import { getDashboardStats, getRecentActivityLogs } from "@/lib/data/admin";
import { DataRestoreCard } from "@/components/admin/DataRestoreCard";
import ActivityLogList from "@/components/admin/ActivityLogList";
import PendingApprovals from "@/components/admin/PendingApprovals";
import { getPendingApprovals } from "@/lib/actions/admin";

export default async function AdminDashboardPage() {
    const [stats, activityLogs, pendingUsers] = await Promise.all([
        getDashboardStats(),
        getRecentActivityLogs(10),
        getPendingApprovals()
    ]);

    // Format today's classes info
    const todayClassesInfo = stats.todayClasses.length > 0
        ? stats.todayClasses.map(c => c.start_time?.slice(0, 5)).join(' / ')
        : '없음';

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
                        <div className="text-2xl font-bold">{stats.totalStudents}명</div>
                        <p className="text-xs text-slate-500 mt-1">
                            {stats.newStudentsThisMonth > 0
                                ? `+${stats.newStudentsThisMonth}명 (이번 달)`
                                : '이번 달 신규 없음'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">미확인 숙제</CardTitle>
                        <FileText className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.ungradedQuests > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
                            {stats.ungradedQuests}개
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {stats.ungradedQuests > 0 ? '빠른 확인이 필요해요!' : '모두 확인 완료'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">오늘의 수업</CardTitle>
                        <BookOpen className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.todayClasses.length > 0 ? 'text-blue-600' : 'text-slate-900'}`}>
                            {stats.todayClasses.length}건
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{todayClassesInfo}</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Q&A 질문</CardTitle>
                        <Bell className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.unansweredQna}건</div>
                        <p className="text-xs text-slate-500 mt-1">학생 Q&A 게시판</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Approvals */}
            <PendingApprovals pendingUsers={pendingUsers} />

            {/* Data Restoration Section */}
            <DataRestoreCard />

            {/* Recent Activity List */}
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>최근 활동 로그</CardTitle>
                </CardHeader>
                <CardContent>
                    <ActivityLogList logs={activityLogs} />
                </CardContent>
            </Card>
        </div>
    );
}
