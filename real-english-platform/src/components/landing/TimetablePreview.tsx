"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, User, Users } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// Mock Data Structure
const timeSlots = ["09:00 - 12:00", "14:00 - 17:00", "19:00 - 22:00"];
const days = ["평일 (화/목)", "토요일", "일요일"];

export default function TimetablePreview({ classes = [] }: { classes?: any[] }) {
    // Transform DB classes to Grid Data
    const scheduleData: Record<string, any[]> = React.useMemo(() => {
        // Initialize empty structure
        const data: Record<string, any[]> = {
            "09:00 - 12:00": [{ type: "empty" }, { type: "empty" }, { type: "empty" }],
            "14:00 - 17:00": [{ type: "empty" }, { type: "empty" }, { type: "empty" }],
            "19:00 - 22:00": [{ type: "empty" }, { type: "empty" }, { type: "empty" }]
        };

        classes.forEach((cls) => {
            if (!cls.is_active) return;

            // Determine Time Slot (Row)
            let timeKey = "";
            if (cls.start_time?.startsWith("09") || cls.schedule?.includes("09:00")) timeKey = "09:00 - 12:00";
            else if (cls.start_time?.startsWith("14") || cls.schedule?.includes("14:00")) timeKey = "14:00 - 17:00";
            else if (cls.start_time?.startsWith("19") || cls.schedule?.includes("19:00")) timeKey = "19:00 - 22:00";

            if (!timeKey) return;

            // Determine Day Index (Column)
            let dayIndex = -1;
            const dayStr = cls.day_of_week || cls.schedule;
            if (dayStr?.includes("평일") || dayStr?.includes("화") || dayStr?.includes("목")) dayIndex = 0;
            else if (dayStr?.includes("토")) dayIndex = 1;
            else if (dayStr?.includes("일")) dayIndex = 2;

            if (dayIndex === -1) return;

            // Construct Card Data
            data[timeKey][dayIndex] = {
                id: cls.id,
                day: days[dayIndex],
                type: "recruiting", // Default to recruiting for landing page
                title: cls.name,
                tag: cls.name.includes("개인") || cls.name.includes("1:1") ? "개인" : "그룹",
                status: "모집중",
                date: cls.schedule // Use schedule string as subtitle/date for now
            };
        });

        return data;
    }, [classes]);


    const getStatusStyles = (status: string) => {
        switch (status) {
            case "진행중": return "bg-blue-600 text-white border-blue-600 hover:bg-blue-700";
            case "모집중": return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
            case "마감": return "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200";
            default: return "bg-white border-dashed border-slate-300";
        }
    };


    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />

            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center text-center mb-16 mx-auto max-w-3xl">
                    <div className="space-y-4 mb-8">
                        <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium bg-blue-50 text-blue-600">
                            Class Schedule
                        </Badge>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
                            나의 수업 시간표
                        </h2>
                        <p className="text-slate-500 text-lg">
                            진행 중인 수업을 클릭하면 상세 페이지로 이동합니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-blue-200 bg-blue-50"></div><span className="text-sm font-medium text-slate-600">개인 (1:1 맞춤)</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-blue-200 bg-blue-50"></div><span className="text-sm font-medium text-slate-600">개인&그룹</span></div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-blue-200 bg-blue-50"></div><span className="text-sm font-medium text-slate-600">일반반</span></div>
                        <div className="w-px h-4 bg-slate-300 mx-2 hidden md:block"></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div><span className="text-sm text-slate-600">진행중</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div><span className="text-sm text-slate-600">모집중</span></div>
                    </div>
                </div>

                {/* Announcement Banner */}
                <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2 text-orange-800 text-sm md:text-base">
                    <span className="font-bold">ⓘ 안내사항:</span>
                    평일은 보강, 내신대비, 개인 과외 위주로 모집합니다.
                </div>

                {/* Scheduler Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Header Row (Desktop) */}
                    <div className="hidden md:flex items-center justify-center font-bold text-slate-400 bg-slate-50 rounded-xl p-4">TIME</div>
                    {days.map((day, i) => (
                        <div key={i} className="hidden md:flex items-center justify-center font-bold text-slate-700 bg-slate-50 rounded-xl p-4">
                            {day}
                        </div>
                    ))}

                    {/* Time Slots Rows */}
                    {timeSlots.map((time, idx) => (
                        <React.Fragment key={idx}>
                            {/* Time Label */}
                            <div key={`time-${idx}`} className="flex md:flex-col items-center justify-center p-4 bg-slate-50 rounded-xl font-medium text-slate-500 text-sm md:text-base">
                                <Clock className="w-4 h-4 md:mb-2 mr-2 md:mr-0 inline" />
                                <div className="text-center">{time}</div>
                            </div>

                            {/* Class Cards */}
                            {/* @ts-ignore */}
                            {scheduleData[time].map((slot: any, sIdx: number) => (
                                <motion.div
                                    key={`${idx}-${sIdx}`}
                                    whileHover={{ scale: slot.type !== "empty" ? 1.02 : 1 }}
                                    className="h-full"
                                >
                                    {slot.type === "empty" ? (
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
                                    )}
                                </motion.div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
}
