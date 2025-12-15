import { getUserProfile } from "@/lib/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProfileForm from "@/components/settings/ProfileForm";

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
                        <ProfileForm email={user.email || ''} initialName={user.name || ''} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
