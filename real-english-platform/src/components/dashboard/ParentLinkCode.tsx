"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrCreateLinkCode } from "@/lib/actions/parent";
import { Copy, Check, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ParentLinkCode() {
    const [linkCode, setLinkCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showCode, setShowCode] = useState(false);

    const fetchLinkCode = async () => {
        setIsLoading(true);
        try {
            const result = await getOrCreateLinkCode();
            if (result.success && result.code) {
                setLinkCode(result.code);
                setShowCode(true);
            } else if (result.message) {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("코드를 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!linkCode) return;

        try {
            await navigator.clipboard.writeText(linkCode);
            setCopied(true);
            toast.success("코드가 복사되었습니다!");
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error("복사에 실패했습니다.");
        }
    };

    return (
        <Card className="border-0 shadow-md bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-green-800 text-sm">학부모 연결 코드</h3>
                        <p className="text-xs text-green-600 mb-2">
                            학부모님께 이 코드를 전달해주세요.
                        </p>

                        {showCode && linkCode ? (
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xl tracking-widest bg-white px-3 py-1 rounded border border-green-200 text-green-700">
                                    {linkCode}
                                </span>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 border-green-200"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-green-600" />
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-green-200 text-green-700 hover:bg-green-100"
                                onClick={fetchLinkCode}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        생성 중...
                                    </>
                                ) : (
                                    "코드 확인하기"
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
