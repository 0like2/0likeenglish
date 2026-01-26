"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Clock, GraduationCap, Users } from "lucide-react";
import { toast } from "sonner";
import { approveUser, rejectUser } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

interface PendingUser {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface PendingApprovalsProps {
    pendingUsers: PendingUser[];
}

export default function PendingApprovals({ pendingUsers }: PendingApprovalsProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    if (pendingUsers.length === 0) {
        return null; // 승인 대기 없으면 표시 안함
    }

    const handleApprove = async (userId: string, userName: string) => {
        setLoading(userId);
        try {
            const result = await approveUser(userId);
            if (result.success) {
                toast.success(`${userName}님을 승인했습니다.`);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("승인 처리 중 오류가 발생했습니다.");
        } finally {
            setLoading(null);
        }
    };

    const handleReject = async (userId: string, userName: string) => {
        if (!confirm(`정말 ${userName}님의 가입을 거부하시겠습니까?`)) return;

        setLoading(userId);
        try {
            const result = await rejectUser(userId);
            if (result.success) {
                toast.success(`${userName}님의 가입을 거부했습니다.`);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("거부 처리 중 오류가 발생했습니다.");
        } finally {
            setLoading(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2 text-amber-800">
                    <Clock className="w-4 h-4" />
                    승인 대기 ({pendingUsers.length}명)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {pendingUsers.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-amber-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    {user.role === 'parent' ? (
                                        <Users className="w-5 h-5 text-slate-500" />
                                    ) : (
                                        <GraduationCap className="w-5 h-5 text-slate-500" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-900">{user.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {user.role === 'parent' ? '학부모' : '학생'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                    <p className="text-xs text-slate-400">{formatDate(user.created_at)}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => handleReject(user.id, user.name)}
                                    disabled={loading === user.id}
                                >
                                    <UserX className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(user.id, user.name)}
                                    disabled={loading === user.id}
                                >
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    승인
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
