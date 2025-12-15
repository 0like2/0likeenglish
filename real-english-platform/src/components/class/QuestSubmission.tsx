"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Check, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";
import { submitQuestProof } from "@/app/actions/quest";

interface QuestSubmissionProps {
    questId: string;
    currentCount: number;
    targetCount: number;
    isCompleted: boolean;
}

export default function QuestSubmission({ questId, currentCount, targetCount, isCompleted }: QuestSubmissionProps) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `homework/${questId}/${Date.now()}.${fileExt}`; // Added homework/ prefix for better organization
            const { error: uploadError, data } = await supabase.storage
                .from('images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            // 3. Update DB via Server Action
            await submitQuestProof(questId, publicUrl);

            toast.success("인증 완료! 횟수가 추가되었습니다.");

        } catch (error) {
            console.error(error);
            toast.error("업로드 실패. 다시 시도해주세요.");
        } finally {
            setUploading(false);
        }
    };

    if (isCompleted) {
        return (
            <Button disabled variant="outline" className="w-full bg-green-50 text-green-600 border-green-200">
                <Check className="w-4 h-4 mr-2" />
                완료됨 ({currentCount}/{targetCount})
            </Button>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <input
                type="file"
                id={`upload-${questId}`}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
            />
            <label htmlFor={`upload-${questId}`}>
                <Button
                    variant="outline"
                    className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                    asChild
                    disabled={uploading}
                >
                    <span className="cursor-pointer flex items-center justify-center">
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                업로드 중...
                            </>
                        ) : (
                            <>
                                <Camera className="w-4 h-4 mr-2" />
                                사진으로 인증하기 ({currentCount}/{targetCount})
                            </>
                        )}
                    </span>
                </Button>
            </label>
        </div>
    );
}
