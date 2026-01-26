"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import { unassignClass } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UnassignClassButtonProps {
    studentId: string;
    studentName: string;
    classId: string;
    className: string;
}

export default function UnassignClassButton({
    studentId,
    studentName,
    classId,
    className
}: UnassignClassButtonProps) {
    const router = useRouter();

    const handleUnassign = async () => {
        try {
            await unassignClass(studentId, classId);
            toast.success(`${studentName} 학생을 '${className}'에서 제외했습니다.`);
            router.refresh();
        } catch (e: any) {
            console.error("Unassign Error:", e);
            toast.error(`반 배정 해제 중 오류가 발생했습니다: ${e.message || '알 수 없는 오류'}`);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                    title="반 배정 해제"
                >
                    <X className="w-3 h-3" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>반 배정 해제</AlertDialogTitle>
                    <AlertDialogDescription>
                        <span className="font-semibold">{studentName}</span> 학생을{' '}
                        <span className="font-semibold">'{className}'</span>에서 제외하시겠습니까?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleUnassign}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        해제
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
