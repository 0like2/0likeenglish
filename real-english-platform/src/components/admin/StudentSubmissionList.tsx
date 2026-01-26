"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, RotateCcw, Eye, Calendar, Award } from "lucide-react";
import { toast } from "sonner";
import { deleteSubmission, resetQuestProgress } from "@/lib/actions/admin";

interface Submission {
    id: string;
    type?: 'listening' | 'easy' | 'quest';
    title: string;
    score?: number;
    detail?: string;
    className?: string;
    imageUrl?: string;
    count?: number;
    status?: string;
    createdAt: string;
}

interface StudentSubmissionListProps {
    submissions: Submission[];
    type: 'listening' | 'easy' | 'quest';
    onRefresh: () => void;
}

export default function StudentSubmissionList({ submissions, type, onRefresh }: StudentSubmissionListProps) {
    const [deleteTarget, setDeleteTarget] = useState<Submission | null>(null);
    const [resetTarget, setResetTarget] = useState<Submission | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setLoading(true);
        const result = await deleteSubmission(type, deleteTarget.id);
        setLoading(false);

        if (result.success) {
            toast.success(result.message);
            onRefresh();
        } else {
            toast.error(result.message);
        }
        setDeleteTarget(null);
    };

    const handleReset = async () => {
        if (!resetTarget) return;
        setLoading(true);
        const result = await resetQuestProgress(resetTarget.id);
        setLoading(false);

        if (result.success) {
            toast.success(result.message);
            onRefresh();
        } else {
            toast.error(result.message);
        }
        setResetTarget(null);
    };

    if (submissions.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500">
                제출 내역이 없습니다.
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {submissions.map((sub) => (
                    <div
                        key={sub.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="font-medium text-slate-900">{sub.title}</span>
                                {sub.className && (
                                    <Badge variant="outline" className="text-xs">{sub.className}</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(sub.createdAt)}
                                </span>
                                {sub.score !== undefined && (
                                    <span className="flex items-center gap-1">
                                        <Award className="w-3 h-3" />
                                        {sub.score}점 ({sub.detail})
                                    </span>
                                )}
                                {sub.count !== undefined && (
                                    <span>{sub.count}회 제출</span>
                                )}
                                {sub.status && (
                                    <Badge variant={sub.status === 'completed' ? 'default' : 'secondary'}>
                                        {sub.status === 'completed' ? '완료' : '진행중'}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            {sub.imageUrl && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setImagePreview(sub.imageUrl!)}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    보기
                                </Button>
                            )}
                            {type === 'quest' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setResetTarget(sub)}
                                    className="text-orange-600 hover:text-orange-700"
                                >
                                    <RotateCcw className="w-4 h-4 mr-1" />
                                    초기화
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTarget(sub)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                삭제
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>제출 기록 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                            &quot;{deleteTarget?.title}&quot; 제출 기록을 삭제하시겠습니까?
                            <br />
                            <span className="text-red-500">이 작업은 되돌릴 수 없습니다.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {loading ? "삭제 중..." : "삭제"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reset Confirmation Dialog */}
            <AlertDialog open={!!resetTarget} onOpenChange={() => setResetTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>숙제 진행 초기화</AlertDialogTitle>
                        <AlertDialogDescription>
                            &quot;{resetTarget?.title}&quot; 진행 상황을 초기화하시겠습니까?
                            <br />
                            제출 횟수와 이미지가 초기화되지만 기록은 유지됩니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReset}
                            disabled={loading}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {loading ? "초기화 중..." : "초기화"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Image Preview Dialog */}
            <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>제출 이미지</DialogTitle>
                    </DialogHeader>
                    {imagePreview && (
                        <div className="flex justify-center">
                            <img
                                src={imagePreview}
                                alt="제출 이미지"
                                className="max-h-[70vh] object-contain rounded-lg"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
