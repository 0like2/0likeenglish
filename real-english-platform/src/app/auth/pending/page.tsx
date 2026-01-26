import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";
import Link from "next/link";

export default function PendingApprovalPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-amber-600" />
                    </div>
                    <CardTitle className="text-xl">승인 대기 중</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-slate-600">
                        회원가입이 완료되었습니다.<br />
                        관리자 승인 후 서비스를 이용하실 수 있습니다.
                    </p>
                    <p className="text-sm text-slate-500">
                        승인까지 최대 24시간이 소요될 수 있습니다.<br />
                        급한 경우 선생님께 직접 문의해주세요.
                    </p>
                    <div className="pt-4">
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/auth/login">
                                <LogOut className="w-4 h-4 mr-2" />
                                로그인 페이지로 돌아가기
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
