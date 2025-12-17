"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthButtons from "@/components/auth/AuthButtons";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [isInAppBrowser, setIsInAppBrowser] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        // Detect Kakao, Naver, Instagram, Facebook, Line
        if (/KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line/i.test(userAgent)) {
            setIsInAppBrowser(true);
        }
    }, []);

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

    if (isInAppBrowser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden border-orange-200">
                    <CardHeader className="bg-orange-50 border-b border-orange-100 pb-6 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-orange-100 p-3 rounded-full">
                                <span className="text-3xl">⚠️</span>
                            </div>
                        </div>
                        <CardTitle className="text-xl font-bold text-orange-900">외부 브라우저로 열어주세요</CardTitle>
                        <CardDescription className="text-orange-700 font-medium mt-2">
                            현재 앱(카톡, 인스타 등) 내부 브라우저에서는<br />구글 보안 정책상 로그인이 차단됩니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-8 bg-white p-6 text-center">
                        <p className="text-slate-600 leading-relaxed">
                            화면 우측 상단/하단의 <span className="font-bold bg-slate-100 px-2 py-0.5 rounded">⋮</span> 또는 <span className="font-bold bg-slate-100 px-2 py-0.5 rounded">...</span> 버튼을 누르고<br />
                            <span className="text-blue-600 font-bold">"다른 브라우저로 열기"</span> (Chrome/Safari)를<br />
                            선택해주시면 정상적으로 로그인 됩니다!
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
