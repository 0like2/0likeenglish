import { createClient } from "@/lib/supabase/server";
import ExamForm from "@/components/admin/ExamForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewExamPage() {
    // No need to fetch classes for Global Exams
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/exams">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">모의고사 등록</h1>
                    <p className="text-slate-500 mt-1">새로운 모의고사 정답과 배점을 등록합니다.</p>
                </div>
            </div>

            <ExamForm />
        </div>
    );
}
