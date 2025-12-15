"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function StudentListFilters() {
    return (
        <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input type="search" placeholder="이름 또는 학교 검색" className="pl-9 bg-white" />
            </div>
            <Button variant="outline">필터</Button>
        </div>
    );
}
