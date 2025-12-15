"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

interface LessonLogProps {
    date: string;
    content: string;
}

export default function LessonLog({ date, content }: LessonLogProps) {
    return (
        <Card className="shadow-md border-slate-100 h-full">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-800">📝 수업 일지</span>
                    </CardTitle>
                    <Badge variant="outline" className="text-slate-500 bg-white">
                        {date}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-6 prose prose-slate max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
            </CardContent>
        </Card>
    );
}
