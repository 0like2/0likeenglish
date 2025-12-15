"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertCircle, CheckCircle, Calendar } from "lucide-react";

interface PaymentStatusProps {
    currentCount: number; // Total paid count (e.g. 4)
    usedCount: number;    // Used count (e.g. 1)
    status: string;
    nextPaymentDate: string;
    recentLessons: any[]; // Array of lesson objects
}

export default function PaymentStatus({ currentCount, usedCount, status, nextPaymentDate, recentLessons }: PaymentStatusProps) {
    const safeTotal = currentCount > 0 ? currentCount : 4;
    const remaining = safeTotal - usedCount;

    const getStatusColor = () => {
        switch (status) {
            case "active": return "text-green-600 bg-green-50 border-green-200";
            case "pending": return "text-amber-600 bg-amber-50 border-amber-200";
            case "expired": return "text-red-600 bg-red-50 border-red-200";
            default: return "text-slate-600 bg-slate-50 border-slate-200";
        }
    };

    return (
        <Card className="shadow-sm border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <CreditCard className="w-24 h-24 text-slate-900" />
            </div>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">수강권 진행 현황</CardTitle>
                    <Badge variant="outline" className={getStatusColor()}>
                        {status === "active" ? "이용 중" : status === "pending" ? "결제 대기" : "만료됨"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end mb-2">
                            <h3 className="text-2xl font-bold text-slate-900">
                                {remaining > 0 ? `${remaining}회 남음` : "수강 완료"}
                                <span className="text-sm font-normal text-slate-400 ml-2">({usedCount}/{safeTotal})</span>
                            </h3>
                        </div>

                        {/* Linear Progress Dots */}
                        <div className="flex items-center justify-between gap-2 relative">
                            {/* Background Line */}
                            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 -z-10" />

                            {Array.from({ length: safeTotal }).map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-1 bg-white px-1">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${i < usedCount
                                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                            : "bg-white border-slate-200 text-slate-300"
                                        }`}>
                                        {i < usedCount ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : (
                                            <span className="text-xs font-bold">{i + 1}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-sm text-slate-500 flex items-center justify-end">
                        {status === 'pending' ? (
                            <span className="text-amber-600 font-medium flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                수강료 입금 확인 중
                            </span>
                        ) : (
                            <span>다음 결제일: <span className="font-medium text-slate-700">{nextPaymentDate}</span></span>
                        )}
                    </div>

                    {/* Timeline / Recent Lessons */}
                    {recentLessons.length > 0 && (
                        <div className="border-t border-slate-100 pt-4">
                            <p className="text-xs text-slate-400 mb-2 font-medium">최근 수업 기록</p>
                            <div className="space-y-2">
                                {recentLessons.map((lesson, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-md">
                                        <CheckCircle className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium text-slate-900">{lesson.date}</span>
                                        <span className="text-xs text-slate-400 line-clamp-1">{lesson.content || "수업 완료"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
