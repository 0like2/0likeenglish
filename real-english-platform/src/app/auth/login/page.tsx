"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthButtons from "@/components/auth/AuthButtons";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);


        // Simulate API delay
        setTimeout(() => {
            if (email.toLowerCase().includes("admin")) {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        }, 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
                <CardHeader className="space-y-1 bg-white border-b pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
                            <Rocket className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center tracking-tight">환영합니다!</CardTitle>
                    <CardDescription className="text-center font-medium text-slate-500">
                        Real English 수업 관리를 위해 로그인해주세요.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-8 bg-slate-50/50">
                    <AuthButtons />
                </CardContent>
                <CardFooter className="pb-8 bg-slate-50/50 justify-center">
                    <p className="text-xs text-slate-400 text-center">
                        로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다. <br />
                        Real English 학생들을 위한 전용 플랫폼입니다.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
