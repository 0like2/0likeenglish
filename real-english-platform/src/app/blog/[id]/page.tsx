import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

async function getBlogPost(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return null;
    return data;
}

export default async function BlogPostPage({ params }: PageProps) {
    const { id } = await params;
    const post = await getBlogPost(id);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <Button variant="ghost" size="sm" className="mb-6 text-slate-500 hover:text-slate-900" asChild>
                    <Link href="/board">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        목록으로 돌아가기
                    </Link>
                </Button>

                {/* Article */}
                <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 sm:p-8 border-b border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                {post.category || "General"}
                            </Badge>
                            <div className="flex items-center text-sm text-slate-400">
                                <Calendar className="w-4 h-4 mr-1" />
                                {format(new Date(post.created_at), 'yyyy년 MM월 dd일')}
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                            {post.title}
                        </h1>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        <div
                            className="prose prose-slate max-w-none
                                prose-headings:font-bold prose-headings:text-slate-900
                                prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
                                prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                                prose-p:text-slate-600 prose-p:leading-relaxed
                                prose-li:text-slate-600
                                prose-strong:text-slate-900
                                prose-pre:bg-slate-900 prose-pre:text-slate-100
                                prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded
                            "
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>
                </article>

                {/* Navigation */}
                <div className="mt-8 flex justify-center">
                    <Button variant="outline" asChild>
                        <Link href="/board">
                            다른 학습자료 보기
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
