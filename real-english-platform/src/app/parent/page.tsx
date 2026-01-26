import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getLinkedChildren } from "@/lib/actions/parent";
import { getUserProfile } from "@/lib/data/dashboard";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { UserPlus, GraduationCap, ChevronRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ParentDashboardPage() {
    const user = await getUserProfile();

    if (!user) {
        redirect('/auth/login');
    }

    if (user.role !== 'parent') {
        redirect('/dashboard');
    }

    const children = await getLinkedChildren();
    const today = format(new Date(), "yyyy년 MM월 dd일 (EEE)", { locale: ko });

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            안녕하세요, <span className="text-green-600">{user?.name || "학부모"}</span>님!
                        </h1>
                        <p className="text-slate-500 mt-1">
                            자녀의 학습 현황을 확인하세요.
                        </p>
                    </div>
                    <Badge className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 px-3 py-1 text-sm shadow-sm h-9">
                        {today}
                    </Badge>
                </div>

                {/* Children List */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold">연결된 자녀</CardTitle>
                        <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                            <Link href="/parent/link">
                                <UserPlus className="w-4 h-4 mr-2" />
                                자녀 연결
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {children.length === 0 ? (
                            <div className="text-center py-12">
                                <GraduationCap className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 mb-4">연결된 자녀가 없습니다.</p>
                                <p className="text-sm text-slate-400 mb-6">
                                    자녀에게 연결 코드를 받아 연결해주세요.
                                </p>
                                <Button asChild className="bg-green-600 hover:bg-green-700">
                                    <Link href="/parent/link">
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        자녀 연결하기
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {children.map((link: any) => {
                                    const child = link.student;
                                    const className = child?.class_members?.[0]?.classes?.name;

                                    return (
                                        <Link
                                            key={link.id}
                                            href={`/parent/child/${link.student_id}`}
                                            className="block"
                                        >
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                                        <GraduationCap className="w-6 h-6 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {child?.name || '이름 없음'}
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            {className || '반 미배정'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-400" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-green-800 mb-2">학부모 가이드</h3>
                        <ul className="space-y-2 text-sm text-green-700">
                            <li>• 자녀 카드를 클릭하면 학습 현황을 상세히 볼 수 있습니다.</li>
                            <li>• 자녀의 대시보드에서 숙제 진행률, 시험 점수 등을 확인할 수 있습니다.</li>
                            <li>• 연결 코드는 자녀의 대시보드 설정에서 확인할 수 있습니다.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
