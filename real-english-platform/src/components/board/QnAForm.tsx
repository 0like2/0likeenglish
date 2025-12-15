"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { useState } from "react";

export default function QnAForm() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => setSubmitted(true), 500);
    };

    if (submitted) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-4 animate-in fade-in">
                <h3 className="text-xl font-bold text-green-700">질문이 등록되었습니다! ✅</h3>
                <p className="text-green-600">선생님이 확인 후 빠른 시일 내에 답변 드릴게요.</p>
                <Button variant="outline" onClick={() => setSubmitted(false)} className="bg-white hover:bg-green-50 text-green-700 border-green-300">
                    다른 질문 하기
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select defaultValue="general">
                    <SelectTrigger id="category" className="bg-white">
                        <SelectValue placeholder="질문 유형을 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="general">일반 문의</SelectItem>
                        <SelectItem value="homework">숙제 관련</SelectItem>
                        <SelectItem value="class">수업 내용 질문</SelectItem>
                        <SelectItem value="schedule">일정 변경 요청</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input id="title" placeholder="궁금한 내용을 요약해주세요" className="bg-white" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                    id="content"
                    placeholder="자세한 내용을 적어주세요. (비공개로 전달됩니다)"
                    className="min-h-[150px] bg-white resize-none"
                    required
                />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base">
                <Send className="w-4 h-4 mr-2" />
                선생님께 질문 보내기
            </Button>

            <p className="text-xs text-center text-slate-400">
                * 작성된 질문은 선생님만 볼 수 있습니다.
            </p>
        </form>
    );
}
