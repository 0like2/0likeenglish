import PaymentStatus from "@/components/dashboard/PaymentStatus";
import HomeworkProgress from "@/components/dashboard/HomeworkProgress";
import LearningPath from "@/components/dashboard/LearningPath";
import LearningStreak from "@/components/dashboard/LearningStreak";
import MonthlyReport from "@/components/dashboard/MonthlyReport";
import ParentLinkCode from "@/components/dashboard/ParentLinkCode";
import { Badge } from "@/components/ui/badge";
import { getUserProfile, getPaymentStatus, getClassInfo, getDashboardData, getReportData, getStreakData } from "@/lib/data/dashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const [dashboardData, reportData] = await Promise.all([
        getDashboardData(),
        getReportData()
    ]);
    const { user, payment, classInfo, recentLessons, quests, usedLessonCount } = dashboardData;

    // Get streak data for the user
    const streakData = user ? await getStreakData(user.id) : null;
    const today = format(new Date(), "yyyy년 MM월 dd일 (EEE)", { locale: ko });

    // Status mapping & Dates
    const payStatus = payment?.status === 'active' || payment?.status === 'pending' || payment?.status === 'expired'
        ? payment.status : 'active';
    const nextPayDate = payment?.expiry_date ? format(new Date(payment.expiry_date), "yyyy-MM-dd") : "미정";

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            반가워요, <span className="text-blue-600">{user?.name || "학생"}</span> 학생! 👋
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {classInfo ? `${classInfo.name} 수업을 듣고 계시네요.` : "아직 배정된 수업이 없어요."}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {(user?.role === 'teacher' || user?.role === 'admin') && (
                            <Button asChild variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Link href="/admin">
                                    🎓 관리자 대시보드
                                </Link>
                            </Button>
                        )}
                        <Badge className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 px-3 py-1 text-sm shadow-sm h-9">
                            📅 {today}
                        </Badge>
                    </div>
                </div>

                {/* Parent Link Code for Students */}
                {(user?.role === 'student' || !user?.role) && (
                    <ParentLinkCode />
                )}

                {/* Top Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PaymentStatus
                        currentCount={payment?.class_count || 4}
                        usedCount={usedLessonCount}
                        status={payStatus}
                        nextPaymentDate={nextPayDate}
                        recentLessons={recentLessons}
                    />
                    <HomeworkProgress
                        quests={quests || []}
                    />
                </div>

                {/* Second Row - 2x2 layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LearningPath quests={quests || []} />
                    {streakData && (
                        <LearningStreak
                            currentStreak={streakData.currentStreak}
                            longestStreak={streakData.longestStreak}
                            thisMonthDays={streakData.thisMonthDays}
                            totalDays={streakData.totalDays}
                            recentActivity={streakData.recentActivity}
                        />
                    )}
                </div>

                {/* Monthly Report - Full Width */}
                <div className="w-full">
                    <MonthlyReport data={reportData} />
                </div>
            </div>
        </div>
    );
}
