"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { linkParentToStudent } from "@/lib/actions/parent";
import { ArrowLeft, Link2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LinkChildPage() {
    const [linkCode, setLinkCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!linkCode.trim()) {
            toast.error("연결 코드를 입력해주세요.");
            return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const result = await linkParentToStudent(linkCode.trim());

            if (result.success) {
                toast.success(result.message);
                router.push('/parent');
                router.refresh();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("연결 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-6">
            <div className="max-w-md mx-auto space-y-6">
                {/* Back Button */}
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/parent">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        뒤로 가기
                    </Link>
                </Button>

                {/* Link Card */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <Link2 className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-xl">자녀 연결하기</CardTitle>
                        <CardDescription>
                            자녀에게 받은 6자리 연결 코드를 입력해주세요.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="linkCode">연결 코드</Label>
                                <Input
                                    id="linkCode"
                                    type="text"
                                    placeholder="예: ABC123"
                                    value={linkCode}
                                    onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                    className="text-center text-2xl tracking-widest font-mono uppercase"
                                    disabled={isSubmitting}
                                    autoComplete="off"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700"
                                disabled={isSubmitting || linkCode.length < 6}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        연결 중...
                                    </>
                                ) : (
                                    "연결하기"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Help Card */}
                <Card className="border-0 shadow bg-amber-50">
                    <CardContent className="p-4">
                        <h3 className="font-semibold text-amber-800 mb-2">연결 코드는 어디서 받나요?</h3>
                        <p className="text-sm text-amber-700">
                            자녀가 학생 계정으로 로그인 후, 대시보드에서 &quot;학부모 연결 코드&quot;를 확인할 수 있습니다.
                            해당 6자리 코드를 받아 위에 입력해주세요.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
