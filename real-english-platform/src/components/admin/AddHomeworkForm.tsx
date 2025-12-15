"use client";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function AddHomeworkForm({ className }: { className: string }) {
    const [open, setOpen] = useState(false);

    const handleSubmit = () => {
        toast.success("숙제가 성공적으로 등록되었습니다.");
        setOpen(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 text-slate-600">
                    <Plus className="w-3 h-3" /> 숙제 추가
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>숙제 / 공지 등록</SheetTitle>
                    <SheetDescription>
                        선택한 반({className})에 새로운 과제를 부여합니다.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                    <div className="space-y-2">
                        <Label>분류</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="유형 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="word">단어 암기</SelectItem>
                                <SelectItem value="listening">듣기 평가</SelectItem>
                                <SelectItem value="grammar">문법 과제</SelectItem>
                                <SelectItem value="notice">공지사항</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>제목</Label>
                        <Input placeholder="예: Day 15~16 단어 암기" />
                    </div>
                    <div className="space-y-2">
                        <Label>마감 기한</Label>
                        <Input type="date" />
                    </div>
                    <div className="space-y-2">
                        <Label>상세 내용</Label>
                        <Textarea placeholder="학생들에게 전달할 구체적인 지시사항을 적어주세요." className="h-32" />
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline">취소</Button>
                    </SheetClose>
                    <Button onClick={handleSubmit}>등록하기</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
