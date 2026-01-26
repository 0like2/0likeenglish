"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { answerQuestion } from "@/lib/actions/qna";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface QnAAnswerFormProps {
    questionId: string;
}

export default function QnAAnswerForm({ questionId }: QnAAnswerFormProps) {
    const [answer, setAnswer] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!answer.trim()) {
            toast.error("답변 내용을 입력해주세요.");
            return;
        }

        setIsLoading(true);
        try {
            const result = await answerQuestion(questionId, answer);

            if (result.success) {
                toast.success("답변이 등록되었습니다!");
                setAnswer("");
                router.refresh();
            } else {
                toast.error(result.message || "답변 등록에 실패했습니다.");
            }
        } catch (error) {
            toast.error("오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-2 pt-2 border-t border-amber-200">
            <Textarea
                placeholder="답변을 입력하세요..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[80px] bg-white"
                disabled={isLoading}
            />
            <div className="flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !answer.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            전송 중...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            답변 등록
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
