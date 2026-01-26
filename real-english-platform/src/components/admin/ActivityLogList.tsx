"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteActivityLog, updateActivityLog } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

interface ActivityLog {
    id: string;
    text: string;
    type: string;
    time: string;
    userId: string;
    userName: string;
}

interface ActivityLogListProps {
    logs: ActivityLog[];
}

export default function ActivityLogList({ logs }: ActivityLogListProps) {
    const router = useRouter();
    const [editingLog, setEditingLog] = useState<ActivityLog | null>(null);
    const [editText, setEditText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleEdit = (log: ActivityLog) => {
        setEditingLog(log);
        setEditText(log.text);
    };

    const handleDelete = async (logId: string) => {
        if (!confirm("이 로그를 삭제하시겠습니까?")) return;

        setIsDeleting(true);
        const result = await deleteActivityLog(logId);
        setIsDeleting(false);

        if (result.success) {
            toast.success("로그가 삭제되었습니다.");
            router.refresh();
        } else {
            toast.error(result.message || "삭제 실패");
        }
    };

    const handleUpdate = async () => {
        if (!editingLog) return;
        if (!editText.trim()) {
            toast.error("내용을 입력해주세요.");
            return;
        }

        setIsUpdating(true);
        const result = await updateActivityLog(editingLog.id, editText);
        setIsUpdating(false);

        if (result.success) {
            toast.success("로그가 수정되었습니다.");
            setEditingLog(null);
            router.refresh();
        } else {
            toast.error(result.message || "수정 실패");
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'submit': return 'bg-green-500';
            case 'payment': return 'bg-orange-500';
            case 'exam': return 'bg-blue-500';
            case 'listening': return 'bg-purple-500';
            case 'class_assign': return 'bg-indigo-500';
            default: return 'bg-slate-500';
        }
    };

    if (logs.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                <p>아직 기록된 활동이 없습니다.</p>
                <p className="text-sm mt-1">학생들의 숙제 제출, 모의고사 응시 등의 활동이 여기에 표시됩니다.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getTypeColor(log.type)}`} />
                            <span className="text-sm text-slate-700 truncate">{log.text}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            <span className="text-xs text-slate-400 whitespace-nowrap">{log.time}</span>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 hover:bg-slate-100"
                                onClick={() => handleEdit(log)}
                            >
                                <Pencil className="w-3 h-3 text-slate-400" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 hover:bg-red-50"
                                onClick={() => handleDelete(log.id)}
                                disabled={isDeleting}
                            >
                                <Trash2 className="w-3 h-3 text-red-400" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingLog} onOpenChange={(open) => !open && setEditingLog(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>로그 수정</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            placeholder="로그 내용을 입력하세요"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingLog(null)}>취소</Button>
                        <Button onClick={handleUpdate} disabled={isUpdating}>
                            {isUpdating ? "저장 중..." : "저장"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
