import PaymentStatus from "@/components/dashboard/PaymentStatus";
import HomeworkProgress from "@/components/dashboard/HomeworkProgress";
import LearningPath from "@/components/dashboard/LearningPath";
import MonthlyReport from "@/components/dashboard/MonthlyReport";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getChildInfo } from "@/lib/actions/parent";
import { getPaymentStatus, getClassInfo, getRecentLessons, getQuestProgress, getLessonCountSincePayment } from "@/lib/data/dashboard";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ChildDashboardPage({ params }: PageProps) {
    const { id: childId } = await params;

    // Verify parent is authorized to view this child
    const { authorized, child } = await getChildInfo(childId);

    if (!authorized || !child) {
        redirect('/parent');
    }

    const today = format(new Date(), "yyyy년 MM월 dd일 (EEE)", { locale: ko });

    // Get child's dashboard data
    const [payment, classInfo] = await Promise.all([
        getPaymentStatus(child.id),
        getClassInfo(child.id)
    ]);

    let recentLessons: any[] = [];
    let quests: any[] = [];
    let usedLessonCount = 0;

    if (classInfo) {
        const [lessonsData, questsData, lessonCount] = await Promise.all([
            getRecentLessons(classInfo.id),
            getQuestProgress(classInfo.id, child.id),
            getLessonCountSincePayment(classInfo.id, payment?.payment_date)
        ]);
        recentLessons = lessonsData;
        quests = questsData;
        usedLessonCount = lessonCount;
    }

    // Status mapping & Dates
    const payStatus = payment?.status === 'active' || payment?.status === 'pending' || payment?.status === 'expired'
        ? payment.status : 'active';
    const nextPayDate = payment?.expiry_date ? format(new Date(payment.expiry_date), "yyyy-MM-dd") : "미정";

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Back Button */}
                <Button asChild variant="ghost" className="mb-2">
                    <Link href="/parent">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        자녀 목록으로
                    </Link>
                </Button>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                학부모 보기
                            </Badge>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            <span className="text-blue-600">{child?.name || "학생"}</span> 학생의 학습 현황
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {classInfo ? `${classInfo.name} 수업을 듣고 있습니다.` : "아직 배정된 수업이 없습니다."}
                        </p>
                    </div>
                    <Badge className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 px-3 py-1 text-sm shadow-sm h-9">
                        {today}
                    </Badge>
                </div>

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
                        classId={classInfo?.id}
                    />
                </div>

                {/* Main Content Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <LearningPath quests={quests || []} />
                    <MonthlyReport />
                </div>
            </div>
        </div>
    );
}
