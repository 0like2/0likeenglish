"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link"; // Need to import Link at top

// ... imports remain same ...

// Mock Data Structure
const timeSlots = ["09:00 - 12:00", "14:00 - 17:00", "19:00 - 22:00"];
const days = ["평일 (화/목)", "토요일", "일요일"];

const scheduleData = {
    "09:00 - 12:00": [
        { day: "평일 (화/목)", type: "empty" },
        { id: "11111111-1111-4111-8111-111111111111", day: "토요일", type: "active", title: "고3 수능 대비반", tag: "개인", status: "진행중", date: "2025-12-20" },
        { id: "22222222-2222-4222-8222-222222222222", day: "일요일", type: "recruiting", title: "중등 심화반", tag: "그룹", status: "모집중" },
    ],
    "14:00 - 17:00": [
        { id: "33333333-3333-4333-8333-333333333333", day: "평일 (화/목)", type: "active", title: "고2 내신 집중반", tag: "그룹", status: "진행중", date: "2025-12-16" },
        { day: "토요일", type: "empty" },
        { id: "44444444-4444-4444-8444-444444444444", day: "일요일", type: "closed", title: "고3 실전 모의고사", tag: "그룹", status: "마감" },
    ],
    "19:00 - 22:00": [
        { id: "55555555-5555-4555-8555-555555555555", day: "평일 (화/목)", type: "recruiting", title: "직장인 회화 기초", tag: "개인", status: "모집중" },
        { id: "66666666-6666-4666-8666-666666666666", day: "토요일", type: "active", title: "토익 900+ 반", tag: "그룹", status: "진행중", date: "2025-12-20" },
        { day: "일요일", type: "empty" },
    ]
};

// ... helpers remain same ...

// inside component return map loop
// ...
{
    slot.type === "empty" ? (
        <div className="h-full min-h-[140px] rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm hover:border-blue-300 hover:text-blue-400 transition-colors cursor-pointer bg-slate-50/50">
            <span className="hidden md:inline">Empty</span>
            <span className="md:hidden">Empty</span>
        </div>
    ) : (
    <Link href={`/class/${slot.id}`} className="block h-full">
        <Card className={`h-full min-h-[140px] border flex flex-col justify-between p-5 shadow-sm transition-all duration-300 hover:scale-[1.02] ${getStatusStyles(slot.status)}`}>
            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <Badge variant={slot.tag === "개인" ? "secondary" : "outline"} className="bg-white/20 text-current border-white/20 backdrop-blur-sm">
                        {slot.tag === "개인" ? <User className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
                        {slot.tag}
                    </Badge>
                    <span className="text-xs font-medium opacity-80">{slot.status}</span>
                </div>
                <div>
                    <h4 className="font-bold text-lg leading-tight mb-1">{slot.title}</h4>
                    {slot.date && <p className="text-xs opacity-80">다음 수업: {slot.date}</p>}
                </div>
            </div>
        </Card>
    </Link>
)
}
