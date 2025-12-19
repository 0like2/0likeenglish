"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { getBlogPosts, BlogPost } from "@/lib/data/blog";
import { format } from "date-fns";

export default function BlogList() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            const data = await getBlogPosts();
            setPosts(data);
            setLoading(false);
        };
        fetchPosts();
    }, []);

    if (loading) {
        return <div className="text-center py-20 text-slate-400">Loading learning materials...</div>;
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400">아직 등록된 학습 자료가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow border-slate-100 group flex flex-col h-full">
                    <div className={`h-48 w-full bg-slate-100 flex items-center justify-center text-slate-400 font-medium group-hover:bg-slate-200 transition-colors duration-500`}>
                        {/* Placeholder for now since no image upload yet */}
                        <span>{post.category} Material</span>
                    </div>
                    <CardHeader className="space-y-2 flex-none">
                        <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="font-normal text-xs text-slate-500 bg-slate-100">
                                {post.category || "General"}
                            </Badge>
                            <div className="flex items-center text-xs text-slate-400">
                                <Calendar className="w-3 h-3 mr-1" />
                                {format(new Date(post.created_at), 'yyyy.MM.dd')}
                            </div>
                        </div>
                        <CardTitle className="line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            <Link href={`/blog/${post.id}`}>{post.title}</Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-slate-500 text-sm line-clamp-3">
                            {/* Simple text preview from markdown/content */}
                            {post.content?.substring(0, 100)}...
                        </p>
                    </CardContent>
                    <CardFooter className="flex-none">
                        <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild>
                            <Link href={`/blog/${post.id}`}>
                                Read More <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
