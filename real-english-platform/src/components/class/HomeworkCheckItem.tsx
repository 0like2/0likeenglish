"use client";

import { useTransition } from "react";
import { toggleLessonCheck } from "@/lib/actions/check";
import { Circle, Triangle, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { IconProps } from "@radix-ui/react-icons/dist/types";

interface HomeworkCheckItemProps {
    lessonId: string;
    field: string;
    label: string;
    content: string;
    status: string; // 'none' | 'done' | 'ambiguous' | 'failed'
    iconColor: string;
    Icon: React.ElementType;
}

export default function HomeworkCheckItem({
    lessonId, field, label, content, status, iconColor, Icon
}: HomeworkCheckItemProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            try {
                await toggleLessonCheck(lessonId, field);
            } catch (e) {
                toast.error("상태 변경 실패");
            }
        });
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'done': return <Circle className="w-5 h-5 text-green-600 fill-green-100" />;
            case 'ambiguous': return <Triangle className="w-5 h-5 text-yellow-500 fill-yellow-100" />;
            case 'failed': return <X className="w-5 h-5 text-red-500" />;
            default: return <div className="w-5 h-5 rounded-full border-2 border-slate-200 hover:border-slate-300" />;
        }
    };

    return (
        <div className="flex items-start gap-3 group">
            <Icon className={cn("w-5 h-5 mt-0.5", iconColor)} />
            <div className="flex-1">
                <span className={cn("text-xs font-bold block mb-1", iconColor)}>{label}</span>
                <p className="text-sm text-slate-700">{content}</p>
            </div>

            <button
                onClick={handleToggle}
                disabled={isPending}
                className={cn(
                    "p-1 rounded-full transition-all active:scale-95",
                    isPending ? "opacity-50" : "opacity-100 hover:bg-slate-100"
                )}
                title="클릭하여 상태 변경 (완료/세모/미완료)"
            >
                {getStatusIcon()}
            </button>
        </div>
    );
}
