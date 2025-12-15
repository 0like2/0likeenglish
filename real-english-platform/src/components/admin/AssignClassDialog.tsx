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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { assignClass } from "@/lib/actions/admin";

interface ClassOption {
    id: string;
    name: string;
    schedule: string;
}

interface AssignClassDialogProps {
    studentName: string;
    studentId: string;
    classes: ClassOption[];
}

export default function AssignClassDialog({ studentName, studentId, classes }: AssignClassDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState("");

    const handleAssign = async () => {
        if (!selectedClass) {
            toast.error("반을 선택해주세요.");
            return;
        }

        try {
            await assignClass(studentId, selectedClass);
            const className = classes.find(c => c.id === selectedClass)?.name;
            toast.success(`${studentName} 학생을 '${className}'에 배정했습니다.`);
            setOpen(false);
            setSelectedClass("");
        } catch (e) {
            toast.error("반 배정 중 오류가 발생했습니다.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="w-3 h-3" /> 반 배정
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>수업 배정 ({studentName})</DialogTitle>
                    <DialogDescription>
                        학생이 수강할 새로운 반을 선택하고 추가합니다.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="class" className="text-right">
                            반 선택
                        </Label>
                        <Select onValueChange={setSelectedClass} value={selectedClass}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="반을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.length === 0 ? (
                                    <SelectItem value="none" disabled>개설된 수업이 없습니다</SelectItem>
                                ) : (
                                    classes.map(cls => (
                                        <SelectItem key={cls.id} value={cls.id}>
                                            {cls.name} ({cls.schedule})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleAssign}>배정하기</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

