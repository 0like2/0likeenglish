"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, AlertCircle, CheckCircle } from "lucide-react";

interface PaymentStatusProps {
    currentCount: number;
    totalCount: number;
    status: "active" | "pending" | "expired";
    nextPaymentDate: string;
}

export default function PaymentStatus({ currentCount, totalCount, status, nextPaymentDate }: PaymentStatusProps) {
    // Calculate percentage for circle
    // Prevent division by zero
    const safeTotal = totalCount > 0 ? totalCount : 1;
    const percentage = (currentCount / safeTotal) * 100;

    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <CreditCard className="w-24 h-24" />
            </div>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">수강권 상태</CardTitle>
                    <Badge variant="outline" className={getStatusColor()}>
                        {status === "active" ? "이용 중" : status === "pending" ? "결제 대기" : "만료됨"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex items-center gap-6">
                    {/* Circular Progress */}
                    <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                stroke="#e2e8f0"
                                strokeWidth="6"
                                fill="transparent"
                            />
                            <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                stroke={status === 'active' ? "#2563eb" : "#94a3b8"}
                                strokeWidth="6"
                                strokeLinecap="round"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-xl font-bold text-slate-900">{currentCount}</span>
                            <span className="text-xs text-slate-400">/ {totalCount}회</span>
                        </div>
                    </div>

                    <div className="space-y-1 z-10">
                        <h3 className="text-2xl font-bold text-slate-900">
                            {totalCount - currentCount}회 남음
                        </h3>
                        <div className="flex items-center text-sm text-slate-500">
                            {status === 'pending' ? (
                                <span className="text-amber-600 font-medium flex items-center">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    입금 확인 중
                                </span>
                            ) : (
                                <span>다음 결제일: <span className="font-medium text-slate-700">{nextPaymentDate}</span></span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
