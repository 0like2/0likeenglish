"use client";

import { Button } from "@/components/ui/button";
import { Search, FlaskConical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function StudentListFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const showTestAccounts = searchParams.get('showTest') === 'true';

    const toggleTestAccounts = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (showTestAccounts) {
            params.delete('showTest');
        } else {
            params.set('showTest', 'true');
        }
        router.push(`/admin/students?${params.toString()}`);
    };

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input type="search" placeholder="이름 또는 학교 검색" className="pl-9 bg-white" />
            </div>
            <div className="flex items-center gap-2">
                <Checkbox
                    id="showTest"
                    checked={showTestAccounts}
                    onCheckedChange={toggleTestAccounts}
                />
                <Label htmlFor="showTest" className="text-sm text-slate-600 flex items-center gap-1 cursor-pointer">
                    <FlaskConical className="w-4 h-4" />
                    테스트 계정 표시
                </Label>
            </div>
        </div>
    );
}
