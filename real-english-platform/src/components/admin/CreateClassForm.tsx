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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

import { createClass } from "@/lib/actions/admin";

export default function CreateClassForm() {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", schedule: "", price: "" });

    const handleSubmit = async () => {
        if (!formData.name || !formData.schedule) {
            toast.error("필수 정보를 모두 입력해주세요.");
            return;
        }

        try {
            await createClass({
                name: formData.name,
                schedule: formData.schedule,
                price: Number(formData.price) || 0
            });
            toast.success(`새로운 수업 '${formData.name}'이(가) 개설되었습니다!`);
            setOpen(false);
            setFormData({ name: "", schedule: "", price: "" });
        } catch (e) {
            toast.error("수업 생성 중 오류가 발생했습니다.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <PlusCircle className="w-4 h-4" /> 새 수업 만들기
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>새 수업 개설</DialogTitle>
                    <DialogDescription>
                        수업 이름과 시간표, 수강료를 입력하여 새로운 반을 만듭니다.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">수업명</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="예: 수능 영어 완성반"
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="schedule" className="text-right">시간표</Label>
                        <Input
                            id="schedule"
                            value={formData.schedule}
                            onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                            placeholder="예: 월/수/금 7PM"
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">수강료</Label>
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
                    <Button type="submit" onClick={handleSubmit}>개설하기</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
