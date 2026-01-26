"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteQuestion } from "@/lib/actions/qna";
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

interface QnADeleteButtonProps {
    questionId: string;
    title: string;
}

export default function QnADeleteButton({ questionId, title }: QnADeleteButtonProps) {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const result = await deleteQuestion(questionId);

            if (result.success) {
                toast.success("질문이 삭제되었습니다.");
                router.refresh();
            } else {
                toast.error(result.message || "삭제에 실패했습니다.");
            }
        } catch (error) {
            toast.error("오류가 발생했습니다.");
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>질문 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                        &quot;{title}&quot; 질문을 삭제하시겠습니까?
                        <br />
                        이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        삭제
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
