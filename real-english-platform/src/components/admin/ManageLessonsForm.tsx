"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createLesson } from "@/lib/actions/class";
import { BookOpen } from "lucide-react";

interface ManageLessonsFormProps {
    classId: string;
    className: string;
    exams: { id: string; title: string, category: string }[]; // New prop
    onSuccess?: () => void;
}

export default function ManageLessonsForm({ classId, className, exams, onSuccess }: ManageLessonsFormProps) {
    const [formData, setFormData] = useState({
        date: "",
        title: "",
        content: "",
        vocab_hw: "",
        listening_hw: "",
        grammar_hw: "",
        other_hw: "",
        exam_id: "" // New field
    });

    const handleSubmit = async () => {
        if (!formData.date || !formData.title) {
            toast.error("날짜와 제목은 필수입니다.");
            return;
        }

        try {
            await createLesson(classId, formData);
            toast.success("수업 로그가 추가되었습니다.");
            setFormData({
                date: "", title: "", content: "",
                vocab_hw: "", listening_hw: "", grammar_hw: "", other_hw: "",
                exam_id: ""
            });
            if (onSuccess) onSuccess();
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "등록 실패: 권한을 확인하세요.");
        }
    };

    return (
        <div className="space-y-6 py-4">
            <h4 className="font-semibold text-lg">수업/숙제 로그 등록</h4>
            <p className="text-sm text-slate-500 mb-4">{className} 반에 새로운 수업 및 과제 내용을 기록합니다.</p>

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
                        <Label className="text-right font-medium text-slate-700">단어</Label>
                        <Input
                            className="col-span-3"
                            placeholder="예: Day 1-5 암기"
                            value={formData.vocab_hw}
                            onChange={e => setFormData({ ...formData, vocab_hw: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-medium text-slate-700">듣기</Label>
                        <Input
                            className="col-span-3"
                            placeholder="예: Chapter 1 Dictation"
                            value={formData.listening_hw}
                            onChange={e => setFormData({ ...formData, listening_hw: e.target.value })}
                        />
                    </div>

                    {/* Mock Exam Attachment */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-medium text-slate-700">모의고사 질문</Label>
                        <div className="col-span-3">
                            <Select
                                value={formData.exam_id}
                                onValueChange={(value) => setFormData({ ...formData, exam_id: value === 'none' ? '' : value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="모의고사 선택 (선택사항)" />
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
                        <Label className="text-right font-medium text-slate-700">문법</Label>
                        <Input
                            className="col-span-3"
                            placeholder="예: p.50-55 풀기"
                            value={formData.grammar_hw}
                            onChange={e => setFormData({ ...formData, grammar_hw: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-medium text-slate-700">기타</Label>
                        <Input
                            className="col-span-3"
                            placeholder="추가 과제"
                            value={formData.other_hw}
                            onChange={e => setFormData({ ...formData, other_hw: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <Button onClick={handleSubmit} className="bg-slate-900 w-full">등록하기</Button>
        </div>
    );
}
