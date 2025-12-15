import FAQList from "@/components/board/FAQList";
import QnAForm from "@/components/board/QnAForm";
import { Badge } from "@/components/ui/badge";

export default function QnAPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-6">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <Badge variant="outline" className="border-blue-200 text-blue-600 bg-white">
                        Help Center
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        무엇이든 물어보세요
                    </h1>
                    <p className="text-lg text-slate-500">
                        자주 묻는 질문을 확인하거나 선생님께 직접 질문을 남길 수 있습니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Left Column: FAQ */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            💡 자주 묻는 질문 (FAQ)
                        </h2>
                        <FAQList />
                    </div>

                    {/* Right Column: QnA Form */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 sticky top-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                            💬 1:1 질문하기
                        </h2>
                        <QnAForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
