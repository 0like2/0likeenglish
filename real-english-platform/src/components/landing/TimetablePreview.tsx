import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, User, Users } from "lucide-react";
import { motion } from "framer-motion";

// Mock Data Structure
const timeSlots = ["09:00 - 12:00", "14:00 - 17:00", "19:00 - 22:00"];
const days = ["평일 (화/목)", "토요일", "일요일"];

const scheduleData = {
    "09:00 - 12:00": [
        { day: "평일 (화/목)", type: "empty" },
        { day: "토요일", type: "active", title: "고3 수능 대비반", tag: "개인", status: "진행중" },
        { day: "일요일", type: "recruiting", title: "중등 심화반", tag: "그룹", status: "모집중" },
    ],
    "14:00 - 17:00": [
        { day: "평일 (화/목)", type: "active", title: "고2 내신 집중반", tag: "그룹", status: "진행중" },
        { day: "토요일", type: "empty" },
        { day: "일요일", type: "closed", title: "고3 실전 모의고사", tag: "그룹", status: "마감" },
    ],
    "19:00 - 22:00": [
        { day: "평일 (화/목)", type: "recruiting", title: "직장인 회화 기초", tag: "개인", status: "모집중" },
        { day: "토요일", type: "active", title: "토익 900+ 반", tag: "그룹", status: "진행중" },
        { day: "일요일", type: "empty" },
    ]
};

const getStatusStyles = (status: string) => {
    switch (status) {
        case "진행중": return "bg-blue-600 text-white border-blue-600 hover:bg-blue-700";
        case "모집중": return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
        case "마감": return "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200";
        default: return "bg-white border-dashed border-slate-300";
    }
};

const getBadgeVariant = (tag: string) => {
    return tag === "개인" ? "secondary" : "outline";
};

export default function TimetablePreview() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />

            <div className="container px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="space-y-4">
                        <Badge variant="outline" className="border-blue-200 text-blue-600">Weekly Schedule</Badge>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
                            수업 시간표
                        </h2>
                        <p className="text-slate-500">
                            실시간으로 업데이트되는 수업 일정을 확인하세요.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div><span className="text-sm text-slate-600">진행중</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div><span className="text-sm text-slate-600">모집중</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-100"></div><span className="text-sm text-slate-600">마감</span></div>
                    </div>
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
                                        <div className="h-full min-h-[120px] rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm hover:border-blue-300 hover:text-blue-400 transition-colors cursor-pointer bg-slate-50/50">
                                            <span className="hidden md:inline">예약 가능</span>
                                            <span className="md:hidden">예약 가능 ({days[sIdx]})</span>
                                        </div>
                                    ) : (
                                        <Card className={`h-full min-h-[120px] border flex flex-col justify-between p-5 shadow-sm transition-all duration-300 ${getStatusStyles(slot.status)}`}>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <Badge variant={slot.tag === "개인" ? "secondary" : "outline"} className="bg-white/20 text-current border-white/20 backdrop-blur-sm">
                                                        {slot.tag === "개인" ? <User className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
                                                        {slot.tag}
                                                    </Badge>
                                                    <span className="text-xs font-medium opacity-80">{slot.status}</span>
                                                </div>
                                                <h4 className="font-bold text-lg leading-tight">{slot.title}</h4>
                                            </div>
                                        </Card>
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
