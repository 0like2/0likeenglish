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

export default function CreateClassForm() {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        day: "",
        timeSlot: "",
        price: ""
    });

    const handleSubmit = async () => {
        if (!formData.name || !formData.day || !formData.timeSlot) {
            toast.error("필수 정보를 모두 입력해주세요.");
            return;
        }

        const fullSchedule = `${formData.day} ${formData.timeSlot}`;
        const [startTime, endTime] = formData.timeSlot.split(" - ");

        try {
            await createClass({
                name: formData.name,
                schedule: fullSchedule,
                price: Number(formData.price) || 0,
                day_of_week: formData.day,
                start_time: startTime,
                end_time: endTime
            });
            toast.success(`새로운 수업 '${formData.name}'이(가) 개설되었습니다!`);
            setOpen(false);
            setFormData({ name: "", day: "", timeSlot: "", price: "" });
        } catch (e) {
            console.error(e);
            toast.error("수업 생성 중 오류가 발생했습니다. (권한을 확인해주세요)");
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
                        시간표 시스템에 등록될 수업 정보를 입력하세요.
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
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} className="w-full bg-slate-900">개설하기</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
