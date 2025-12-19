"use client";

import { Button } from "@/components/ui/button";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

import { createClass } from "@/lib/actions/admin";

import { Checkbox } from "@/components/ui/checkbox";

export default function CreateClassForm() {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        day: "",
        timeSlot: "",
        price: "",
        quest_vocab_on: true,
        quest_listening_on: true,
        quest_mock_on: false,
        quest_frequency: 3
    });

    const handleSubmit = async () => {
        if (!formData.name || !formData.day || !formData.timeSlot) {
            toast.error("필수 정보를 모두 입력해주세요.");
            return;
        }

        const fullSchedule = `${formData.day} ${formData.timeSlot}`;
        const [startTime, endTime] = formData.timeSlot.split(" - ");

        try {
            const result = await createClass({
                name: formData.name,
                schedule: fullSchedule,
                price: Number(formData.price) || 0,
                day_of_week: formData.day,
                start_time: startTime,
                end_time: endTime,
                quest_vocab_on: formData.quest_vocab_on,
                quest_listening_on: formData.quest_listening_on,
                quest_mock_on: formData.quest_mock_on,
                quest_frequency: Number(formData.quest_frequency)
            });

            if (result.success) {
                toast.success(`새로운 수업 '${formData.name}'이(가) 개설되었습니다!`);
                setOpen(false);
                setFormData({
                    name: "", day: "", timeSlot: "", price: "",
                    quest_vocab_on: true, quest_listening_on: true, quest_mock_on: false, quest_frequency: 3
                });
            } else {
                toast.error(result.message || "수업 생성 실패");
            }
        } catch (e) {
            console.error(e);
            toast.error("수업 생성 중 알 수 없는 오류가 발생했습니다.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <PlusCircle className="w-4 h-4" /> 새 수업 만들기
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>새 수업 개설</DialogTitle>
                    <DialogDescription>
                        시간표 및 데일리 숙제 설정을 등록합니다.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Class Name */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right font-medium">수업명</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="예: 고3 수능 대비반"
                            className="col-span-3"
                        />
                    </div>

                    {/* Day Selection */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-medium">요일</Label>
                        <div className="col-span-3">
                            <Select onValueChange={(v) => setFormData({ ...formData, day: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="요일 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="평일 (화/목)">평일 (화/목)</SelectItem>
                                    <SelectItem value="토요일">토요일</SelectItem>
                                    <SelectItem value="일요일">일요일</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Time Slot Selection */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-medium">시간</Label>
                        <div className="col-span-3">
                            <Select onValueChange={(v) => setFormData({ ...formData, timeSlot: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="시간대 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="09:00 - 12:00">09:00 - 12:00 (오전)</SelectItem>
                                    <SelectItem value="14:00 - 17:00">14:00 - 17:00 (오후)</SelectItem>
                                    <SelectItem value="19:00 - 22:00">19:00 - 22:00 (저녁)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right font-medium">수강료</Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            placeholder="숫자만 입력 (원)"
                            className="col-span-3"
                        />
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <h4 className="font-semibold text-sm text-slate-900 mb-4">숙제 설정 (Quest)</h4>
                        <div className="grid grid-cols-4 items-center gap-4 mb-4">
                            <Label className="text-right font-medium">필수 과목</Label>
                            <div className="col-span-3 flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="vocab"
                                        checked={formData.quest_vocab_on}
                                        onCheckedChange={(c) => setFormData({ ...formData, quest_vocab_on: c as boolean })}
                                    />
                                    <label htmlFor="vocab" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        영단어
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="listening"
                                        checked={formData.quest_listening_on}
                                        onCheckedChange={(c) => setFormData({ ...formData, quest_listening_on: c as boolean })}
                                    />
                                    <label htmlFor="listening" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        듣기평가
                                    </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="mock"
                                        checked={formData.quest_mock_on}
                                        onCheckedChange={(c) => setFormData({ ...formData, quest_mock_on: c as boolean })}
                                    />
                                    <label htmlFor="mock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        모의고사
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="freq" className="text-right font-medium">주간 횟수</Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Input
                                    id="freq"
                                    type="number"
                                    max={7}
                                    min={1}
                                    value={formData.quest_frequency}
                                    onChange={e => setFormData({ ...formData, quest_frequency: parseInt(e.target.value) })}
                                    className="w-24"
                                />
                                <span className="text-sm text-slate-500">회 / 주</span>
                            </div>
                        </div>
                    </div>

                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} className="w-full bg-slate-900">개설하기</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
