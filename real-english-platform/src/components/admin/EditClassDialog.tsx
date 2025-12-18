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
import { Switch } from "@/components/ui/switch";
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
        vocab_freq: 3,
        quest_listening_on: classData.quest_listening_on ?? true,
        listening_freq: 3,
        quest_mock_on: classData.quest_mock_on ?? false,
        mock_freq: 1
    });
    const [loadingSettings, setLoadingSettings] = useState(false);

    // Initial Load & Settings Fetch
    useEffect(() => {
        if (open) {
            // 1. Basic Info
            let timePart = "";
            if (classData.schedule && classData.day_of_week) {
                timePart = classData.schedule.replace(classData.day_of_week + " ", "").trim();
            } else if (classData.schedule) {
                const parts = classData.schedule.split(" ");
                if (parts.length >= 2) timePart = parts.slice(1).join(" ");
            }

            setFormData(prev => ({
                ...prev,
                name: classData.name,
                day: classData.day_of_week || "",
                timeSlot: timePart || "",
                price: classData.price?.toString() || "",
                quest_vocab_on: classData.quest_vocab_on ?? true,
                quest_listening_on: classData.quest_listening_on ?? true,
                quest_mock_on: classData.quest_mock_on ?? false,
            }));

            // 2. Fetch Detailed Settings (Individual Frequencies)
            const fetchSettings = async () => {
                setLoadingSettings(true);
                try {
                    // Dynamically import to avoid server action in client component issues if any
                    const { getClassSettings } = await import('@/lib/actions/admin');
                    const settings = await getClassSettings(classData.id);
                    setFormData(prev => ({
                        ...prev,
                        vocab_freq: settings.vocab_freq,
                        listening_freq: settings.listening_freq,
                        mock_freq: settings.mock_freq
                    }));
                } catch (e) {
                    console.error("Failed to load settings", e);
                } finally {
                    setLoadingSettings(false);
                }
            };
            fetchSettings();
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
                quest_frequencies: {
                    vocab: formData.vocab_freq,
                    listening: formData.listening_freq,
                    mock: formData.mock_freq
                }
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
                                <SelectItem value="09:00 - 12:00">09:00 - 12:00</SelectItem>
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

                    <div className="border-t pt-4 mt-2">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-sm text-slate-900">숙제 설정 (Quest)</h4>
                            {loadingSettings && <span className="text-xs text-slate-400">설정 불러오는 중...</span>}
                        </div>

                        <div className="space-y-4">
                            {/* Vocab Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Switch
                                        checked={formData.quest_vocab_on}
                                        onCheckedChange={(c) => setFormData({ ...formData, quest_vocab_on: c })}
                                    />
                                    <Label className="font-medium">영단어</Label>
                                </div>
                                {formData.quest_vocab_on && (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                        <Input
                                            type="number"
                                            className="w-16 h-8 text-center"
                                            value={formData.vocab_freq}
                                            onChange={(e) => setFormData({ ...formData, vocab_freq: parseInt(e.target.value) || 0 })}
                                            min={1} max={7}
                                        />
                                        <span className="text-xs text-slate-500">회 / 주</span>
                                    </div>
                                )}
                            </div>

                            {/* Listening Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Switch
                                        checked={formData.quest_listening_on}
                                        onCheckedChange={(c) => setFormData({ ...formData, quest_listening_on: c })}
                                    />
                                    <Label className="font-medium">듣기평가</Label>
                                </div>
                                {formData.quest_listening_on && (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                        <Input
                                            type="number"
                                            className="w-16 h-8 text-center"
                                            value={formData.listening_freq}
                                            onChange={(e) => setFormData({ ...formData, listening_freq: parseInt(e.target.value) || 0 })}
                                            min={1} max={7}
                                        />
                                        <span className="text-xs text-slate-500">회 / 주</span>
                                    </div>
                                )}
                            </div>

                            {/* Mock Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Switch
                                        checked={formData.quest_mock_on}
                                        onCheckedChange={(c) => setFormData({ ...formData, quest_mock_on: c })}
                                    />
                                    <Label className="font-medium">모의고사</Label>
                                </div>
                                {formData.quest_mock_on && (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                        <Input
                                            type="number"
                                            className="w-16 h-8 text-center"
                                            value={formData.mock_freq}
                                            onChange={(e) => setFormData({ ...formData, mock_freq: parseInt(e.target.value) || 0 })}
                                            min={1} max={7}
                                        />
                                        <span className="text-xs text-slate-500">회 / 주</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} className="bg-slate-900">수정 저장</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
