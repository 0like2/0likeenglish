import BlogList from "@/components/board/BlogList";
import { Badge } from "@/components/ui/badge";

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-6">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <Badge variant="outline" className="border-blue-200 text-blue-600 bg-white">
                        Class Blog
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        영어 학습 자료실
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        선생님이 직접 정리한 문법 노트, 필수 단어장, 그리고 입시 전략을 확인하세요.
                    </p>
                </div>

                <BlogList />
            </div>
        </div>
    );
}
