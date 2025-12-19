"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Upload, X, Check, Loader2, Image as ImageIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";
import { submitQuestProof } from "@/app/actions/quest";

interface HomeworkUploadProps {
    quests: any[];
    onUpload?: (file: File) => Promise<void>;
}

export default function HomeworkUpload({ quests }: HomeworkUploadProps) {
    const [selectedQuestId, setSelectedQuestId] = useState<string>("");
    const [preview, setPreview] = useState<string | null>(null);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [compressing, setCompressing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [completed, setCompleted] = useState(false);

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setCompressing(true);

        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        try {
            const compressedFile = await imageCompression(file, options);
            const url = URL.createObjectURL(compressedFile);
            setPreview(url);
            setFileToUpload(compressedFile);
        } catch (error) {
            console.error("Compression error:", error);
            alert("이미지 압축 중 오류가 발생했습니다.");
        } finally {
            setCompressing(false);
        }
    };

    const handleUploadClick = async () => {
        if (!fileToUpload || !selectedQuestId) {
            toast.error("숙제 종류를 선택하고 사진을 올려주세요.");
            return;
        }

        setUploading(true);
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            // 1. Upload to Supabase Storage
            const fileExt = fileToUpload.name.split('.').pop();
            const fileName = `homework/${selectedQuestId}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, fileToUpload);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            // 3. Update DB via Server Action
            await submitQuestProof(selectedQuestId, publicUrl);

            setCompleted(true);
            toast.success("숙제 인증이 완료되었습니다!");

        } catch (error) {
            console.error(error);
            toast.error("업로드에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setUploading(false);
        }
    };

    const clearImage = () => {
        setPreview(null);
        setFileToUpload(null);
        setCompleted(false);
    };

    if (quests.length === 0) {
        return <div className="text-sm text-slate-500 text-center py-4">등록된 퀘스트(숙제)가 없습니다.</div>;
    }

    if (completed) {
        return (
            <div className="w-full h-32 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center justify-center text-green-600 animate-in fade-in zoom-in">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <Check className="w-6 h-6" />
                </div>
                <p className="font-bold">제출 완료!</p>
                <Button variant="ghost" size="sm" onClick={clearImage} className="mt-2 text-green-700 hover:text-green-800 hover:bg-green-100">
                    다른 숙제 제출하기
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full space-y-4">
            {/* Quest Selector */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">어떤 숙제를 제출하시나요?</label>
                <Select value={selectedQuestId} onValueChange={setSelectedQuestId}>
                    <SelectTrigger>
                        <SelectValue placeholder="숙제 항목 선택 (예: 단어인증)" />
                    </SelectTrigger>
                    <SelectContent>
                        {quests.map((quest) => (
                            <SelectItem key={quest.id} value={quest.id}>
                                {quest.title} ({quest.type})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {!preview ? (
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={compressing}
                    />
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            {compressing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        </div>
                        <p className="text-sm font-medium text-slate-600">
                            {compressing ? "이미지 압축 중..." : "클릭하여 사진 업로드"}
                        </p>
                        <p className="text-xs text-slate-400">최대 1MB까지 자동 압축됩니다</p>
                    </div>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 group">
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover opacity-90 group-hover:opacity-60 transition-opacity" />

                    <div className="absolute top-2 right-2">
                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white" onClick={clearImage}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button onClick={handleUploadClick} disabled={uploading || !selectedQuestId}>
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    업로드 중...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {selectedQuestId ? "이제 제출하기" : "숙제 항목을 선택하세요"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
