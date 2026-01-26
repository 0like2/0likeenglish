import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createClient } from "@/lib/supabase/client";
import { Chrome, Mail, UserPlus, GraduationCap, Users } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthButtons() {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState<'student' | 'parent'>('student');
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
            toast.success("로그인 성공!");
            router.push('/dashboard');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "로그인 실패");
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !name) {
            toast.error("모든 필드를 입력해주세요.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("비밀번호가 일치하지 않습니다.");
            return;
        }
        if (password.length < 6) {
            toast.error("비밀번호는 6자 이상이어야 합니다.");
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        role: selectedRole
                    }
                }
            });
            if (error) throw error;

            // 회원가입 성공 시 public.users 테이블에도 추가
            if (data.user) {
                await supabase.from('users').upsert({
                    id: data.user.id,
                    email: email,
                    name: name,
                    role: selectedRole
                });
            }

            toast.success("회원가입 성공! 이메일을 확인해주세요.");
            setIsSignUp(false);
            setPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error.message || "회원가입 실패");
        } finally {
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
                        {isSignUp ? "이메일로 회원가입" : "또는 이메일로 계속하기"}
                    </span>
                </div>
            </div>

            {isSignUp ? (
                <form onSubmit={handleEmailSignUp} className="space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor="name">이름</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="홍길동"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>가입 유형</Label>
                        <RadioGroup
                            value={selectedRole}
                            onValueChange={(value) => setSelectedRole(value as 'student' | 'parent')}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="student" id="role-student" />
                                <Label htmlFor="role-student" className="flex items-center gap-1 cursor-pointer">
                                    <GraduationCap className="w-4 h-4" />
                                    학생
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="parent" id="role-parent" />
                                <Label htmlFor="role-parent" className="flex items-center gap-1 cursor-pointer">
                                    <Users className="w-4 h-4" />
                                    학부모
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
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
                            placeholder="6자 이상"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="비밀번호 재입력"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                        {loading ? "가입 중..." : "회원가입"}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-slate-600"
                        onClick={() => setIsSignUp(false)}
                        disabled={loading}
                    >
                        이미 계정이 있으신가요? 로그인
                    </Button>
                </form>
            ) : (
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
                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-slate-600"
                        onClick={() => setIsSignUp(true)}
                        disabled={loading}
                    >
                        계정이 없으신가요? 회원가입
                    </Button>
                </form>
            )}
        </div>
    );
}
