import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PenTool, Eye, Edit, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getBlogPostsData } from "@/lib/data/admin";
import BlogActions from "@/components/admin/BlogActions";

export const dynamic = 'force-dynamic';

export default async function BlogManagementPage() {
    const posts = await getBlogPostsData();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">블로그/자료실 관리</h1>
                    <p className="text-slate-500 mt-2">학생들에게 학습 자료와 공지사항을 공유하세요.</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Link href="/admin/blog/new">
                        <Plus className="w-4 h-4" /> 새 글 쓰기
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {posts.length === 0 && (
                    <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg">
                        작성된 글이 없습니다. 첫 글을 작성해보세요!
                    </div>
                )}
                {posts.map((post) => (
                    <Card key={post.id} className="flex flex-row items-center justify-between p-4 px-6 hover:shadow-sm transition-shadow">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-slate-500 font-normal">{post.category}</Badge>
                                {post.status === 'draft' && <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">임시저장</Badge>}
                                <h3 className="font-bold text-lg text-slate-800">{post.title}</h3>
                            </div>
                            <span className="text-sm text-slate-400">{post.date} • 조회수 {post.views}</span>
                        </div>

                        <BlogActions postId={post.id} />
                    </Card>
                ))}
            </div>
        </div>
    );
}
