"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { updateClass } from "@/lib/actions/admin";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil } from "lucide-react";

interface EditClassDialogProps {
    classData: {
        id: string;
        name: string;
        price: number;
        day_of_week?: string;
        timeSlot?: string; // Derived or raw schedule?
        schedule?: string; // "화요일 17:00 - 19:00"
        quest_vocab_on?: boolean;
        quest_listening_on?: boolean;
        quest_mock_on?: boolean;
        quest_frequency?: number;
    };
}

export default function EditClassDialog({ classData }: EditClassDialogProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: classData.name,
        day: classData.day_of_week || "",
        timeSlot: "",
        price: classData.price?.toString() || "",
        quest_vocab_on: classData.quest_vocab_on ?? true,
        quest_listening_on: classData.quest_listening_on ?? true,
        quest_mock_on: classData.quest_mock_on ?? false,
        quest_frequency: classData.quest_frequency || 3
    });

    // Parse schedule if day/time not explicitly set, or assume standard format
    useEffect(() => {
        if (open) {
            // Try to parse day and time from schedule string if needed, or rely on passed day_of_week
            // Assuming format "Day Time - Time"
            // For now, let's just use what's passed or try to split schedule
            // "화요일 17:00 - 19:00"
            let timePart = "";
            if (classData.schedule && classData.day_of_week) {
                timePart = classData.schedule.replace(classData.day_of_week + " ", "").trim();
            } else if (classData.schedule) {
                const parts = classData.schedule.split(" ");
                if (parts.length >= 2) timePart = parts.slice(1).join(" ");
            }

            setFormData({
                name: classData.name,
                day: classData.day_of_week || "",
                timeSlot: timePart || "",
                price: classData.price?.toString() || "",
                quest_vocab_on: classData.quest_vocab_on ?? true,
                quest_listening_on: classData.quest_listening_on ?? true,
                quest_mock_on: classData.quest_mock_on ?? false,
                quest_frequency: classData.quest_frequency || 3
            });
        }
    }, [open, classData]);


    const handleSubmit = async () => {
        if (!formData.name || !formData.day || !formData.timeSlot) {
            toast.error("필수 정보를 모두 입력해주세요.");
            return;
        }

        const fullSchedule = `${formData.day} ${formData.timeSlot}`;
        const [startTime, endTime] = formData.timeSlot.split(" - ");

        try {
            await updateClass(classData.id, {
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
            toast.success(`'${formData.name}' 수업이 수정되었습니다!`);
            setOpen(false);
        } catch (e) {
            console.error(e);
            toast.error("수업 수정 중 오류가 발생했습니다.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100"><Pencil className="w-4 h-4 text-slate-500" /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>수업 정보 수정</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="className" className="text-right">수업명</Label>
                        <Input
                            id="className"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="day" className="text-right">요일</Label>
                        <Select value={formData.day} onValueChange={(v) => setFormData({ ...formData, day: v })}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="요일 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="월요일">월요일</SelectItem>
                                <SelectItem value="화요일">화요일</SelectItem>
                                <SelectItem value="수요일">수요일</SelectItem>
                                <SelectItem value="목요일">목요일</SelectItem>
                                <SelectItem value="금요일">금요일</SelectItem>
                                <SelectItem value="토요일">토요일</SelectItem>
                                <SelectItem value="일요일">일요일</SelectItem>
                                <SelectItem value="평일 (화/목)">평일 (화/목)</SelectItem>
                                <SelectItem value="평일 (월/수)">평일 (월/수)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">시간</Label>
                        <Select value={formData.timeSlot} onValueChange={(v) => setFormData({ ...formData, timeSlot: v })}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="시간대 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="15:00 - 17:00">15:00 - 17:00</SelectItem>
                                <SelectItem value="17:00 - 19:00">17:00 - 19:00</SelectItem>
                                <SelectItem value="19:00 - 22:00">19:00 - 22:00</SelectItem>
                                <SelectItem value="10:00 - 13:00">10:00 - 13:00</SelectItem>
                                <SelectItem value="14:00 - 17:00">14:00 - 17:00</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">수강료</Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">숙제 설정</Label>
                        <div className="col-span-3 space-y-4">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="freq" className="text-xs text-slate-500 w-16">주간 횟수</Label>
                                <Input
                                    id="freq"
                                    type="number"
                                    className="w-20 h-8"
                                    value={formData.quest_frequency}
                                    onChange={(e) => setFormData({ ...formData, quest_frequency: parseInt(e.target.value) || 3 })}
                                    min={1} max={7}
                                />
                                <span className="text-xs text-slate-400"> 회 / 주</span>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="edit-vocab"
                                        checked={formData.quest_vocab_on}
                                        onCheckedChange={(c) => setFormData({ ...formData, quest_vocab_on: c as boolean })}
                                    />
                                    <label htmlFor="edit-vocab" className="text-sm font-medium">영단어</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="edit-listening"
                                        checked={formData.quest_listening_on}
                                        onCheckedChange={(c) => setFormData({ ...formData, quest_listening_on: c as boolean })}
                                    />
                                    <label htmlFor="edit-listening" className="text-sm font-medium">듣기평가</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="edit-mock"
                                        checked={formData.quest_mock_on}
                                        onCheckedChange={(c) => setFormData({ ...formData, quest_mock_on: c as boolean })}
                                    />
                                    <label htmlFor="edit-mock" className="text-sm font-medium">모의고사</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>수정 저장</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
