"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Rocket, LogOut, User as UserIcon, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import NotificationBell from "@/components/notification/NotificationBell";

const NAV_ITEMS = [
    { label: "홈", href: "/" },
    { label: "수업 시간표", href: "/schedule" },
    { label: "학습 자료실", href: "/blog" },
    { label: "문의하기", href: "/qna" },
];

interface NavbarProps {
    user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Hide Navbar on login page
    if (pathname === "/auth/login") return null;

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("로그아웃 중 오류가 발생했습니다.");
        } else {
            toast.success("로그아웃 되었습니다.");
            router.refresh();
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 tracking-tight">
                    <Rocket className="w-6 h-6 text-blue-600" />
                    <span>Real English</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-blue-600",
                                pathname === item.href ? "text-blue-600 font-bold" : "text-slate-600"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}

                    {user ? (
                        <div className="flex items-center gap-3 ml-4">
                            {/* Admin Button for specific user */}
                            {user.email === 'dudfkr236@gmail.com' && (
                                <Button asChild size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                    <Link href="/admin">
                                        🎓 관리자
                                    </Link>
                                </Button>
                            )}

                            {/* 알림 벨 */}
                            <NotificationBell />

                            <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-5">
                                <Link href="/dashboard">
                                    마이페이지
                                </Link>
                            </Button>

                            <Button asChild variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 px-2" title="내 정보 설정">
                                <Link href="/settings">
                                    <Settings className="w-4 h-4" />
                                </Link>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-500 hover:text-red-500"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-1" />
                                로그아웃
                            </Button>
                        </div>
                    ) : (
                        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 ml-4">
                            <Link href="/auth/login">
                                <UserIcon className="w-4 h-4 mr-2" />
                                로그인
                            </Link>
                        </Button>
                    )}
                </nav>

                {/* Mobile Nav Toggle */}
                <div className="md:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white absolute w-full shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                                "text-sm font-medium p-2 rounded-lg hover:bg-slate-50",
                                pathname === item.href ? "text-blue-600 bg-blue-50" : "text-slate-600"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}

                    {user ? (
                        <>
                            {/* 모바일 알림 */}
                            <div className="flex justify-center">
                                <NotificationBell />
                            </div>
                            <Button asChild className="w-full bg-slate-900 text-white" onClick={() => setMobileMenuOpen(false)}>
                                <Link href="/dashboard">
                                    마이페이지
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full text-slate-600 border-slate-200" onClick={() => setMobileMenuOpen(false)}>
                                <Link href="/settings">
                                    <Settings className="w-4 h-4 mr-2" />
                                    내 정보 설정
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 border-red-100"
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                            >
                                로그아웃
                            </Button>
                        </>
                    ) : (
                        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setMobileMenuOpen(false)}>
                            <Link href="/auth/login">
                                로그인 / 회원가입
                            </Link>
                        </Button>
                    )}
                </div>
            )}
        </header>
    );
}
