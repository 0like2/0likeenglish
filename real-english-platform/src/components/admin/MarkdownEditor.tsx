"use client";

import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/storage";
import { toast } from "sonner";

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            // Insert markdown at cursor or append
            const imageMarkdown = `\n![${file.name}](${url})\n`;
            onChange(value + imageMarkdown); // Simple append for mvp, could be improved to insert at cursor
            toast.success("이미지가 업로드되었습니다.");
        } catch (error) {
            console.error(error);
            toast.error("이미지 업로드에 실패했습니다.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset input
            }
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px] border rounded-lg overflow-hidden relative">
            {/* Toolbar (Overlay or separate section) */}
            <div className="absolute top-2 right-2 z-10 md:right-1/2 md:mr-6">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                />
                <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2 shadow-sm bg-white/90 hover:bg-white"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    이미지 첨부
                </Button>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white h-full flex flex-col pt-12 md:pt-4"> {/* Padding top for toolbar on mobile */}
                <label className="text-sm font-bold text-slate-500 mb-2">Editor (Markdown)</label>
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="# 제목을 입력하세요..."
                    className="flex-1 resize-none font-mono text-sm focus-visible:ring-0 border-0 p-0 shadow-none"
                />
            </div>

            {/* Preview Area */}
            <div className="p-4 bg-slate-50 h-full flex flex-col border-l">
                <label className="text-sm font-bold text-slate-500 mb-2">Preview</label>
                <ScrollArea className="h-full border rounded-md bg-white p-4 prose prose-sm max-w-none">
                    <ReactMarkdown
                        components={{
                            img: ({ node, ...props }) => (
                                <img {...props} className="rounded-lg shadow-sm max-w-full h-auto" alt={props.alt || "image"} />
                            )
                        }}
                    >
                        {value}
                    </ReactMarkdown>
                </ScrollArea>
            </div>
        </div>
    );
}
