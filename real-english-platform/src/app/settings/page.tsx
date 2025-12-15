import { getUserProfile } from "@/lib/data/dashboard";
import { updateProfile } from "@/app/actions/user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";
import { ArrowLeft, User as UserIcon, Save } from "lucide-react";
import Link from "next/link";
import SubmitButton from "@/components/settings/SubmitButton"; // We'll make this small client component for pending state

export default async function SettingsPage() {
    const user = await getUserProfile();

    if (!user) {
        redirect('/auth/login');
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-md mx-auto space-y-6">
                <Button variant="ghost" asChild className="-ml-2 text-slate-500 hover:text-slate-900">
                    <Link href="/dashboard">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        대시보드로 돌아가기
                    </Link>
                </Button>

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">내 정보 설정</h1>
                    <p className="text-slate-500">계정 정보를 수정할 수 있습니다.</p>
                </div>

                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">프로필 수정</CardTitle>
                        <CardDescription>
                            다른 사람에게 보여질 이름을 설정하세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={updateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">이메일</Label>
                                <Input
                                    id="email"
                                    value={user.email}
                                    disabled
                                    className="bg-slate-50 text-slate-500"
                                />
                                <p className="text-xs text-slate-400">이메일은 변경할 수 없습니다.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">이름 (Display Name)</Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={user.name}
                                        placeholder="이름을 입력하세요"
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <SubmitButton />
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
