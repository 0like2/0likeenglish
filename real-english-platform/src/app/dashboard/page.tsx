import PaymentStatus from "@/components/dashboard/PaymentStatus";
import HomeworkProgress from "@/components/dashboard/HomeworkProgress";
import LearningPath from "@/components/dashboard/LearningPath";
import MonthlyReport from "@/components/dashboard/MonthlyReport";
import { Badge } from "@/components/ui/badge";
import { getUserProfile, getPaymentStatus, getClassInfo, getDashboardData } from "@/lib/data/dashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const { user, payment, classInfo, recentLessons } = await getDashboardData();

    // Format current date
    const today = format(new Date(), "yyyy년 MM월 dd일 (EEE)", { locale: ko });

    // Derive payment props
    // We assume payment.class_count is the TOTAL assigned (e.g. 4)
    // And used count is derived from actual lesson logs.
    const totalSessions = payment?.class_count || 4;
    const usedSessions = recentLessons.length;

    // Status mapping
    const payStatus = (payment?.status === 'active' || payment?.status === 'pending' || payment?.status === 'expired')
        ? payment.status
        : 'active'; // Default to active for demo if no payment record

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

                {/* Top Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PaymentStatus
                        currentCount={totalSessions}
                        usedCount={usedSessions}
                        status={payStatus}
                        nextPaymentDate={nextPayDate}
                        recentLessons={recentLessons}
                    />
                    <HomeworkProgress
                        completed={0} // TODO: Calculate from Real Homeworks
                        total={0} // TODO: Calculate from Real Homeworks
                        streakDays={0}
                    />
                </div>

                {/* Main Content Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <LearningPath />
                    <MonthlyReport />
                </div>

            </div>
        </div>
    );
}
