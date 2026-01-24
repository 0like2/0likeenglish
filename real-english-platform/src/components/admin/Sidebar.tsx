"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    Users,
    BookOpen,
    Headphones,
    PenTool,
    Settings,
    LogOut,
    LayoutDashboard,
    ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
    { label: "대시보드", href: "/admin", icon: LayoutDashboard },
    { label: "학생 관리", href: "/admin/students", icon: Users },
    { label: "수업/반 관리", href: "/admin/classes", icon: BookOpen },
    { label: "모의고사 관리", href: "/admin/exams", icon: ClipboardList },
    // { label: "듣기 관리", href: "/admin/listening", icon: Headphones }, // TODO: 페이지 구현 후 활성화
    { label: "블로그/공지", href: "/admin/blog", icon: PenTool },
    // { label: "설정", href: "/admin/settings", icon: Settings }, // TODO: 페이지 구현 후 활성화
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    🎓 REAL Admin
                </h1>
                <p className="text-xs text-slate-400 mt-1">강사 전용 관리자 패널</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-slate-800 gap-2"
                    asChild
                >
                    <Link href="/auth/login">
                        <LogOut className="w-4 h-4" />
                        로그아웃
                    </Link>
                </Button>
            </div>
        </div>
    );
}
