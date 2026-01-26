"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { updateLesson, deleteLesson } from "@/lib/actions/class";
import { Pencil, Trash2, BookOpen } from "lucide-react";

interface Lesson {
    id: string;
    title: string;
    date: string;
    content: string | null;
    vocab_hw: string | null;
    listening_hw: string | null;
    grammar_hw: string | null;
    other_hw: string | null;
    exam_id: string | null;
    status: string;
}

interface Exam {
    id: string;
    title: string;
    category: string;
}

interface LessonEditDialogProps {
    lesson: Lesson;
    classId: string;
    exams: Exam[];
}

export default function LessonEditDialog({ lesson, classId, exams }: LessonEditDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({
        title: lesson.title || "",
        date: lesson.date || "",
        content: lesson.content || "",
        vocab_hw: lesson.vocab_hw || "",
        listening_hw: lesson.listening_hw || "",
        grammar_hw: lesson.grammar_hw || "",
        other_hw: lesson.other_hw || "",
        exam_id: lesson.exam_id || "",
        status: lesson.status || "upcoming"
    });

    const handleUpdate = () => {
        if (!formData.date || !formData.title) {
            toast.error("날짜와 제목은 필수입니다.");
            return;
        }

        startTransition(async () => {
            try {
                await updateLesson(lesson.id, classId, formData);
                toast.success("수업 로그가 수정되었습니다.");
                setOpen(false);
            } catch (e: any) {
                console.error(e);
                toast.error(e.message || "수정 실패");
            }
        });
    };

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await deleteLesson(lesson.id, classId);
                toast.success("수업 로그가 삭제되었습니다.");
            } catch (e: any) {
                console.error(e);
                toast.error(e.message || "삭제 실패");
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            {/* Edit Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                        <Pencil className="w-3 h-3 mr-1" />
                        수정
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>수업 로그 수정</DialogTitle>
                        <DialogDescription>
                            수업 내용과 숙제를 수정합니다.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-date">수업 날짜</Label>
                                <Input
                                    id="edit-date"
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">수업 주제</Label>
                                <Input
                                    id="edit-title"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-status">상태</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="upcoming">예정</SelectItem>
                                    <SelectItem value="completed">완료</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-content">수업 상세 내용</Label>
                            <Textarea
                                id="edit-content"
                                className="h-20"
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> 과제 / 숙제
                            </h4>

                            <div className="grid gap-3">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-sm">단어</Label>
                                    <Input
                                        className="col-span-3"
                                        value={formData.vocab_hw}
                                        onChange={e => setFormData({ ...formData, vocab_hw: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-sm">듣기</Label>
                                    <Input
                                        className="col-span-3"
                                        value={formData.listening_hw}
                                        onChange={e => setFormData({ ...formData, listening_hw: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-sm">모의고사</Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={formData.exam_id || "none"}
                                            onValueChange={(value) => setFormData({ ...formData, exam_id: value === 'none' ? '' : value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="선택 안 함" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">선택 안 함</SelectItem>
                                                {exams?.map((exam) => (
                                                    <SelectItem key={exam.id} value={exam.id}>
                                                        [{exam.category}] {exam.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-sm">문법</Label>
                                    <Input
                                        className="col-span-3"
                                        value={formData.grammar_hw}
                                        onChange={e => setFormData({ ...formData, grammar_hw: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-sm">기타</Label>
                                    <Input
                                        className="col-span-3"
                                        value={formData.other_hw}
                                        onChange={e => setFormData({ ...formData, other_hw: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            취소
                        </Button>
                        <Button onClick={handleUpdate} disabled={isPending}>
                            {isPending ? "저장 중..." : "저장"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-3 h-3 mr-1" />
                        삭제
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>수업 로그 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                            "{lesson.title}" ({lesson.date}) 로그를 삭제하시겠습니까?
                            <br />
                            이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isPending}
                        >
                            {isPending ? "삭제 중..." : "삭제"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
