import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Chrome, Mail } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthButtons() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const supabase = createClient();
    const router = useRouter();

    const handleLogin = async (provider: 'google' | 'kakao') => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error) {
            toast.error("로그인 중 오류가 발생했습니다.");
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("이메일과 비밀번호를 입력해주세요.");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            router.refresh();
            // Auth state change will be handled by middleware or client hook, but for now just refresh/redirect
        } catch (error: any) {
            toast.error(error.message || "로그인 실패");
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            <Button
                variant="outline"
                className="w-full py-6 text-base relative"
                onClick={() => handleLogin('google')}
                disabled={loading}
            >
                <Chrome className="w-5 h-5 absolute left-4 text-red-500" />
                Google로 계속하기
            </Button>

            <Button
                className="w-full py-6 text-base bg-[#FEE500] hover:bg-[#FDD835] text-black border-none relative"
                onClick={() => handleLogin('kakao')}
                disabled={loading}
            >
                <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C5.9 3 1 6.9 1 11.8c0 3.2 2.1 6.1 5.4 7.6-.2.8-.7 2.8-.8 3.2 0 .1 0 .2.2.2.1 0 .2 0 .3-.1.4-.3 3.8-2.6 4.4-3 .5.1 1 .1 1.5.1 6.1 0 11-3.9 11-8.8C23 6.9 18.1 3 12 3z" />
                </svg>
                카카오로 계속하기
            </Button>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-50 px-2 text-slate-500">
                        또는 이메일로 계속하기
                    </span>
                </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-3">
                <div className="space-y-1">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="password">비밀번호</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="******"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <Button type="submit" className="w-full bg-slate-900" disabled={loading}>
                    {loading ? "로그인 중..." : "이메일 로그인"}
                </Button>
            </form>
        </div>
    );
}
