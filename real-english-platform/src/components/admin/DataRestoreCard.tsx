"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function DataRestoreCard() {
    return (
        <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
                <CardTitle className="text-orange-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    데이터 복구 및 초기화
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-orange-800 mb-4">
                    학습자료실(블로그)이 비어있다면, 초기 예시 데이터(문법, 듣기, 공지사항 등)를 복구할 수 있습니다.
                </p>
                <Button
                    onClick={async () => {
                        if (!confirm('정말로 초기 데이터를 복구하시겠습니까?')) return;
                        const { seedBlogPosts } = await import('@/lib/actions/admin');
                        const result = await seedBlogPosts();
                        if (result.success) {
                            alert("데이터가 성공적으로 복구되었습니다!");
                            window.location.reload();
                        } else {
                            alert("복구 실패: " + result.message);
                        }
                    }}
                    variant="outline"
                    className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100 hover:text-orange-900"
                >
                    학습자료실 예시 데이터 넣기
                </Button>
            </CardContent>
        </Card>
    );
}
