"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createLesson } from "@/lib/actions/class";
import { Plus, BookOpen, Clock } from "lucide-react";

interface ManageLessonsDialogProps {
    classId: string;
    className: string;
}

export default function ManageLessonsDialog({ classId, className }: ManageLessonsDialogProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        date: "",
        title: "",
        content: "",
        vocab_hw: "",
        listening_hw: "",
        grammar_hw: "",
        other_hw: ""
    });

    const handleSubmit = async () => {
        if (!formData.date || !formData.title) {
            toast.error("날짜와 제목은 필수입니다.");
            return;
        }

        try {
            await createLesson(classId, formData);
            toast.success("수업 로그가 추가되었습니다.");
            setOpen(false);
            setFormData({
                date: "", title: "", content: "",
                vocab_hw: "", listening_hw: "", grammar_hw: "", other_hw: ""
            });
        } catch (e) {
            console.error(e);
            toast.error("등록 실패: 권한을 확인하세요.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                    <Plus className="w-4 h-4" /> 수업/숙제 등록
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>수업/숙제 로그 등록</DialogTitle>
                    <DialogDescription>
                        {className} 반에 새로운 수업 및 과제 내용을 기록합니다.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">수업 날짜</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">수업 주제 (제목)</Label>
                            <Input
                                id="title"
                                placeholder="예: Day 15 관계대명사 심화"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">수업 상세 내용 (선택)</Label>
                        <Textarea
                            id="content"
                            placeholder="수업에서 다룬 주요 내용이나 공지사항을 적어주세요."
                            className="h-20"
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" /> 과제 / 숙제
                        </h4>

                        <div className="grid gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-red-600 font-medium">단어 (Vocab)</Label>
                                <Input
                                    className="col-span-3"
                                    placeholder="예: Day 1-5 암기"
                                    value={formData.vocab_hw}
                                    onChange={e => setFormData({ ...formData, vocab_hw: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-purple-600 font-medium">듣기 (LC)</Label>
                                <Input
                                    className="col-span-3"
                                    placeholder="예: Chapter 1 Dictation"
                                    value={formData.listening_hw}
                                    onChange={e => setFormData({ ...formData, listening_hw: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-indigo-600 font-medium">문법 (Grammar)</Label>
                                <Input
                                    className="col-span-3"
                                    placeholder="예: p.50-55 풀기"
                                    value={formData.grammar_hw}
                                    onChange={e => setFormData({ ...formData, grammar_hw: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right text-slate-600 font-medium">기타 알림</Label>
                                <Input
                                    className="col-span-3"
                                    placeholder="추가 전달사항"
                                    value={formData.other_hw}
                                    onChange={e => setFormData({ ...formData, other_hw: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} className="bg-slate-900 w-full sm:w-auto">등록하기</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
