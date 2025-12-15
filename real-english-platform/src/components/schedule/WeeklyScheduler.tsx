"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SCHEDULE_DATA } from "@/lib/mockData";
import { Clock, User, Users, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const timeSlots = ["09:00 - 12:00", "14:00 - 17:00", "19:00 - 22:00"];
const days = ["평일 (화/목)", "토요일", "일요일"];

const getStatusStyles = (status: string) => {
    switch (status) {
        case "진행중": return "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200";
        case "모집중": return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
        case "마감": return "bg-slate-100 text-slate-500 border-slate-200";
        default: return "bg-white border-dashed border-slate-300";
    }
};

export default function WeeklyScheduler() {
    return (
        <div className="w-full max-w-7xl mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Header Row */}
                <div className="hidden md:flex items-center justify-center font-bold text-slate-400 bg-slate-50 rounded-xl p-4">TIME</div>
                {days.map((day, i) => (
                    <div key={i} className="hidden md:flex items-center justify-center font-bold text-slate-700 bg-slate-50 rounded-xl p-4">
                        {day}
                    </div>
                ))}

                {/* Time Slots */}
                {timeSlots.map((time, idx) => (
                    <>
                        {/* Time Label */}
                        <div key={`time-${idx}`} className="flex md:flex-col items-center justify-center p-4 bg-slate-50 rounded-xl font-medium text-slate-500 text-sm md:text-base">
                            <Clock className="w-4 h-4 md:mb-2 mr-2 md:mr-0 inline" />
                            {time}
                        </div>

                        {/* Class Cards */}
                        {/* @ts-ignore */}
                        {SCHEDULE_DATA[time].map((slot: any, sIdx: number) => {
                            const isActive = slot.status === "진행중";
                            const isRecruiting = slot.status === "모집중";

                            const CardContent = (
                                <Card className={cn(
                                    "h-full min-h-[140px] border flex flex-col justify-between p-5 transition-all duration-300 relative overflow-hidden group",
                                    getStatusStyles(slot.status)
                                )}>
                                    {isActive && (
                                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="w-5 h-5 text-white" />
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <Badge variant={slot.tag === "개인" ? "secondary" : "outline"} className={cn(
                                                "backdrop-blur-sm",
                                                isActive ? "bg-white/20 text-white border-white/20" : ""
                                            )}>
                                                {slot.tag === "개인" ? <User className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
                                                {slot.tag}
                                            </Badge>
                                            <span className={cn("text-xs font-medium", isActive ? "text-blue-100" : "text-slate-500")}>
                                                {slot.status}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className={cn("font-bold text-lg leading-tight", isActive ? "text-white" : "text-slate-900")}>
                                                {slot.title}
                                            </h4>
                                            {slot.nextDate && isActive && (
                                                <p className="text-sm text-blue-100 mt-1">다음 수업: {slot.nextDate}</p>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );

                            return (
                                <motion.div
                                    key={`${idx}-${sIdx}`}
                                    whileHover={{ scale: slot.type !== "empty" ? 1.02 : 1 }}
                                    className="h-full"
                                >
                                    {isActive ? (
                                        <Link href={`/class/${slot.id}/${slot.nextDate}`}>
                                            {CardContent}
                                        </Link>
                                    ) : slot.type === "empty" ? (
                                        <div className="h-full min-h-[140px] rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm bg-slate-50/30">
                                            <span className="hidden md:inline">Empty</span>
                                        </div>
                                    ) : (
                                        CardContent
                                    )}
                                </motion.div>
                            );
                        })}
                    </>
                ))}
            </div>
        </div>
    );
}
