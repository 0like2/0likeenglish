"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Assuming Sheet is installed or I'll use simple conditional
import { Menu, X, Rocket } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "홈", href: "/" },
    { label: "수업 시간표", href: "/schedule" },
    { label: "학습 자료실", href: "/blog" },
    { label: "문의하기", href: "/qna" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Hide Navbar on login page? Maybe not needed, but cleaner.
    if (pathname === "/auth/login") return null;

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
                    <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-5">
                        <Link href="/dashboard">
                            마이페이지
                        </Link>
                    </Button>
                </nav>

                {/* Mobile Nav Toggle */}
                <div className="md:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Dropdown (Simple implementation without Sheet for speed if Sheet not fully configured, but let's try simple div overlay) */}
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
                    <Button asChild className="w-full bg-slate-900 text-white" onClick={() => setMobileMenuOpen(false)}>
                        <Link href="/dashboard">
                            마이페이지 로그인
                        </Link>
                    </Button>
                </div>
            )}
        </header>
    );
}
