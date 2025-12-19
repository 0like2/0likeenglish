import { createClient } from "@/lib/supabase/server";
import MockExamOMR from "@/components/exam/MockExamOMR";
import { notFound } from "next/navigation";

interface ExamPageProps {
    params: {
        id: string;
    };
}

export default async function ExamPage({ params }: ExamPageProps) {
    const supabase = await createClient();

    // Fetch Exam Info
    const { data: exam, error } = await supabase
        .from('class_exams')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !exam) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto mb-6 text-center">
                <p className="text-sm text-slate-500 mb-2">Mock Exam</p>
                {/* Title is rendered inside component too, but good to have context or breadcrumbs here if needed */}
            </div>
            <MockExamOMR examId={exam.id} examTitle={exam.title} />
        </div>
    );
}
