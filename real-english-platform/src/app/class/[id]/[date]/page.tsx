import { getLessonDetails, getClassDetails, getClassQuests, getClassExams } from "@/lib/data/class";
import LessonLog from "@/components/class/LessonLog";
import HomeworkChecklist from "@/components/class/HomeworkChecklist";
import HomeworkUpload from "@/components/class/HomeworkUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar, FileCheck, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PageProps {
    params: Promise<{
        id: string;
        date: string;
    }>;
}

export default async function ClassDetailPage({ params }: PageProps) {
    const { id, date } = await params;
    const decodedDate = decodeURIComponent(date);

    // Fetch real data
    const [lessonData, classInfo, fileQuests, exams] = await Promise.all([
        getLessonDetails(id, decodedDate),
        getClassDetails(id),
        getClassQuests(id),
        getClassExams(id)
    ]);

    if (!lessonData || !classInfo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h1 className="text-2xl font-bold text-slate-900">수업 정보를 찾을 수 없습니다.</h1>
                <p className="text-slate-500">날짜: {decodedDate}</p>
                <Button asChild>
                    <Link href={`/class/${id}`}>목록으로 돌아가기</Link>
                </Button>
            </div>
        );
    }

    // Construct homework items from columns
    const homeworks = [];
    if (lessonData.vocab_hw) homeworks.push(lessonData.vocab_hw);
    if (lessonData.listening_hw) homeworks.push(lessonData.listening_hw);
    if (lessonData.grammar_hw) homeworks.push(lessonData.grammar_hw);
    if (lessonData.other_hw) homeworks.push(lessonData.other_hw);

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container px-4 md:px-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild className="pl-0 hover:bg-transparent hover:text-blue-600">
                                <Link href={`/class/${id}`}>
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back
                                </Link>
                            </Button>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                Class Detail
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {classInfo.name}
                        </h1>
                        <div className="flex items-center text-slate-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {decodedDate}
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Lesson Log (Occupies 2/3 on desktop) */}
                    <div className="lg:col-span-2 space-y-6">
                        <LessonLog date={decodedDate} content={lessonData.content || lessonData.title || "등록된 내용이 없습니다."} />

                        {/* Mock Exams List - Placed here or right? Right seems better for 'Tasks/Actions' but let's check content balance. 
                             If many exams, Left is better. If few, Right. 
                             Let's put it in Right column to group with Homework.
                         */}
                    </div>

                    {/* Right Column: Homework & Actions */}
                    <div className="space-y-6">
                        {/* Mock Exams Section */}
                        {exams && exams.length > 0 && (
                            <Card className="shadow-md border-slate-100">
                                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                            <FileCheck className="w-5 h-5 text-blue-600" />
                                            실전 모의고사
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    {exams.map((exam: any) => (
                                        <div key={exam.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                                            <div className="flex-1 min-w-0 mr-3">
                                                <div className="font-medium text-slate-900 truncate">{exam.title}</div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {exam.submission ? (
                                                        <span className="text-green-600 font-bold">
                                                            {exam.submission.score}점
                                                            <span className="font-normal text-slate-400 mx-1">|</span>
                                                            {new Date(exam.submission.created_at).toLocaleDateString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">미응시</span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button size="sm" variant={exam.submission ? "outline" : "default"} asChild>
                                                <Link href={`/exam/${exam.id}`}>
                                                    {exam.submission ? "결과 보기" : "응시하기"}
                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Homework Checklist */}
                        <HomeworkChecklist items={homeworks} />

                        {/* Photo Upload */}
                        <Card className="shadow-md border-slate-100">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                <CardTitle className="text-xl font-bold text-slate-800">📷 숙제 인증</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <HomeworkUpload quests={fileQuests} />
                                <p className="text-xs text-slate-400 mt-2 text-center">
                                    * 인증할 숙제 항목을 선택하고 사진을 올려주세요.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
