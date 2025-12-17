"use client";

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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteClass } from "@/lib/actions/admin";
import { toast } from "sonner";
import { useState } from "react";

interface DeleteClassButtonProps {
    classId: string;
    className: string;
}

export default function DeleteClassButton({ classId, className }: DeleteClassButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteClass(classId);
            toast.success("수업이 삭제되었습니다.");
        } catch (error) {
            console.error(error);
            toast.error("수업 삭제 중 오류가 발생했습니다.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>수업 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                        정말로 '<span className="font-bold text-slate-900">{className}</span>' 수업을 삭제하시겠습니까?
                        <br /><br />
                        <span className="text-red-500 font-medium">경고:</span> 이 수업과 관련된 모든 데이터(과제, 수업 기록, 학생 수강 이력)가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "삭제 중..." : "삭제하기"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
