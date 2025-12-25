'use client';

import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteBlogPost } from "@/lib/actions/admin";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function BlogActions({ postId }: { postId: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("정말 이 글을 삭제하시겠습니까?")) return;

        startTransition(async () => {
            const result = await deleteBlogPost(postId);
            if (!result.success) {
                alert("삭제 실패: " + result.message);
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600" asChild>
                <Link href={`/admin/blog/${postId}`}>
                    <Edit className="w-4 h-4" />
                </Link>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-600"
                onClick={handleDelete}
                disabled={isPending}
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    );
}
