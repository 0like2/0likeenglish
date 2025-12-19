"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createBlogPost } from "@/lib/actions/admin";

export default function NewPostPage() {
    const router = useRouter();
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("grammar"); // Default

    const handleSave = async (status: 'draft' | 'published') => {
        if (!title || !content) {
            toast.error("제목과 내용을 입력해주세요.");
            return;
        }

        try {
            const result = await createBlogPost({
                title,
                content,
                category,
                is_published: status === 'published'
            });

            if (result.success) {
                toast.success(status === 'published' ? "성공적으로 발행되었습니다!" : "임시저장 되었습니다.");
                router.push("/admin/blog");
            } else {
                toast.error(result.message || "등록에 실패했습니다.");
            }
        } catch (error) {
            console.error(error);
            toast.error("글 저장 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/blog"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">새 글 쓰기</h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleSave('draft')}>임시저장</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => handleSave('published')}>
                        <Save className="w-4 h-4" /> 발행하기
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 space-y-2">
                        <Input
                            placeholder="제목을 입력하세요"
                            className="text-lg font-bold h-12 bg-white"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="h-12 bg-white">
                                <SelectValue placeholder="카테고리" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="grammar">문법</SelectItem>
                                <SelectItem value="voca">어휘</SelectItem>
                                <SelectItem value="listening">듣기</SelectItem>
                                <SelectItem value="exam">시험자료</SelectItem>
                                <SelectItem value="notice">공지사항</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <MarkdownEditor value={content} onChange={setContent} />
            </div>
        </div>
    );
}
