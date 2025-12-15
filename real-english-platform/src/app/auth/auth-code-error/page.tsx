import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthCodeErrorPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-slate-50">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md w-full flex flex-col items-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">로그인 오류</h1>
                <p className="text-slate-500 mb-6">
                    인증 과정에서 문제가 발생했습니다.<br />
                    잠시 후 다시 시도하거나 관리자에게 문의해주세요.
                </p>
                <div className="flex gap-3 w-full">
                    <Button variant="outline" className="flex-1" asChild>
                        <Link href="/auth/login">다시 로그인</Link>
                    </Button>
                    <Button className="flex-1" asChild>
                        <Link href="/">홈으로</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
