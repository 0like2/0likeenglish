"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import ManageLessonsForm from "./ManageLessonsForm";

interface ManageLessonsDialogProps {
    classId: string;
    className: string;
}

export default function ManageLessonsDialog({ classId, className }: ManageLessonsDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                    <Plus className="w-4 h-4" /> 수업/숙제 등록
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader className="hidden">
                    <DialogTitle>수업/숙제 로그 등록</DialogTitle>
                    <DialogDescription>
                        {className} 반에 새로운 수업 및 과제 내용을 기록합니다.
                    </DialogDescription>
                </DialogHeader>

                <ManageLessonsForm classId={classId} className={className} onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
