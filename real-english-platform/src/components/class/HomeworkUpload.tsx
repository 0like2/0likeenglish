"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Upload, X, Check, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HomeworkUploadProps {
    onUpload: (file: File) => Promise<void>;
}

export default function HomeworkUpload({ onUpload }: HomeworkUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);
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

            // Auto upload after compression (or manual? Let's do manual for better UX)
        } catch (error) {
            console.error("Compression error:", error);
            alert("이미지 압축 중 오류가 발생했습니다.");
        } finally {
            setCompressing(false);
        }
    };

    const handleUploadClick = async () => {
        if (!preview) return;
        setUploading(true);
        // Simulate/Trigger upload
        await new Promise(r => setTimeout(r, 1500)); // Mock delay
        setCompleted(true);
        setUploading(false);
    };

    const clearImage = () => {
        setPreview(null);
        setCompleted(false);
    };

    if (completed) {
        return (
            <div className="w-full h-32 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center justify-center text-green-600 animate-in fade-in zoom-in">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <Check className="w-6 h-6" />
                </div>
                <p className="font-bold">제출 완료!</p>
                <Button variant="ghost" size="sm" onClick={clearImage} className="mt-2 text-green-700 hover:text-green-800 hover:bg-green-100">
                    다시 제출하기
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full">
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
                        <Button onClick={handleUploadClick} disabled={uploading}>
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    업로드 중...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    이제 제출하기
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
