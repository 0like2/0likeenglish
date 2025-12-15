"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

// Mock Data
const BLOG_POSTS = [
    {
        id: 1,
        title: "수능 필수 영단어 100선 (DAY 1-5)",
        category: "Vocabulary",
        summary: "역대 수능 기출 빈출 단어들을 정리했습니다. 이동 시간에 틈틈이 외워보세요.",
        date: "2025.12.10",
        thumbnail: "bg-blue-100", // Placeholder color
    },
    {
        id: 2,
        title: "2026학년도 수능 영어 분석 및 전략",
        category: "Insight",
        summary: "올해 수능 경향을 분석하고 내년도 대비 전략을 세워봅시다.",
        date: "2025.12.01",
        thumbnail: "bg-indigo-100",
    },
    {
        id: 3,
        title: "관계대명사 vs 관계부사 완벽 정리",
        category: "Grammar",
        summary: "헷갈리기 쉬운 관계사 파트, 이것만 알면 문법 문제 3초 컷!",
        date: "2025.11.20",
        thumbnail: "bg-amber-100",
    },
];

export default function BlogList() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow border-slate-100 group">
                    <div className={`h-48 w-full ${post.thumbnail} flex items-center justify-center text-slate-400 font-medium group-hover:scale-105 transition-transform duration-500`}>
                        {/* Real implementation would use <img src={post.thumbnail} /> */}
                        Thumbnail Image Area
                    </div>
                    <CardHeader className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="font-normal text-xs text-slate-500 bg-slate-100">
                                {post.category}
                            </Badge>
                            <div className="flex items-center text-xs text-slate-400">
                                <Calendar className="w-3 h-3 mr-1" />
                                {post.date}
                            </div>
                        </div>
                        <CardTitle className="line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            <Link href={`/blog/${post.id}`}>{post.title}</Link>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-500 text-sm line-clamp-3">
                            {post.summary}
                        </p>
                    </CardContent>
                    <CardFooter>
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
