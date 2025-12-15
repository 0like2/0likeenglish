import PaymentStatus from "@/components/dashboard/PaymentStatus";
import HomeworkProgress from "@/components/dashboard/HomeworkProgress";
import LearningPath from "@/components/dashboard/LearningPath";
import MonthlyReport from "@/components/dashboard/MonthlyReport";
import { Badge } from "@/components/ui/badge";
import { getUserProfile, getPaymentStatus, getClassInfo, getDashboardData } from "@/lib/data/dashboard";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const { user, payment, classInfo } = await getDashboardData();

    // Format current date
    const today = format(new Date(), "yyyy년 MM월 dd일 (EEE)", { locale: ko });

    // Derive payment props
    const currentCount = payment?.class_count || 0; // Assuming this field is 'remaining count' or similar. 
    // Actually schema says 'class_count' INTEGER DEFAULT 4. Let's assume this is total. 
    // Wait, let's check schema: 'class_count INTEGER DEFAULT 4'. And we don't have 'remaining'.
    // We should probably calculate remaining based on usage, but for now let's map it simply.
    // Let's assume 'class_count' is TOTAL and we need 'used' count. 
    // For MVP, let's just display what we have. 
    // Let's treat 'class_count' as REMAINING for now in the DB manual entry, simplified.

    // Status mapping
    const payStatus = (payment?.status === 'active' || payment?.status === 'pending' || payment?.status === 'expired')
        ? payment.status
        : 'expired';

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
                    <Badge className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 px-3 py-1 text-sm shadow-sm">
                        📅 {today}
                    </Badge>
                </div>

                {/* Top Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PaymentStatus
                        currentCount={currentCount} // DB 'remaining' or 'total'
                        totalCount={4} // Hardcoded standard cycle for now
                        status={payStatus}
                        nextPaymentDate={nextPayDate}
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
