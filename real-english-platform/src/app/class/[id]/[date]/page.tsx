import { CLASS_DETAILS } from "@/lib/mockData";
import LessonLog from "@/components/class/LessonLog";
import HomeworkChecklist from "@/components/class/HomeworkChecklist";
import HomeworkUpload from "@/components/class/HomeworkUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PageProps {
    params: {
        id: string;
        date: string;
    };
}

export default function ClassDetailPage({ params }: PageProps) {
    // Mock data fetching
    // @ts-ignore
    const classData = CLASS_DETAILS[params.id];

    if (!classData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h1 className="text-2xl font-bold text-slate-900">수업 정보를 찾을 수 없습니다.</h1>
                <Button asChild>
                    <Link href="/schedule">시간표로 돌아가기</Link>
                </Button>
            </div>
        );
    }

    // Filter homeworks? Or pass all? user mock data has list
    const homeworks = classData.homework || [];

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container px-4 md:px-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild className="pl-0 hover:bg-transparent hover:text-blue-600">
                                <Link href="/schedule">
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back
                                </Link>
                            </Button>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                Class Detail
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {classData.title}
                        </h1>
                        <div className="flex items-center text-slate-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {params.date} (Decoding needed if encoded)
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Lesson Log (Occupies 2/3 on desktop) */}
                    <div className="lg:col-span-2 space-y-6">
                        <LessonLog date={params.date} content={classData.content} />
                    </div>

                    {/* Right Column: Homework & Actions */}
                    <div className="space-y-6">
                        {/* Homework Checklist */}
                        <HomeworkChecklist items={homeworks} />

                        {/* Photo Upload */}
                        <Card className="shadow-md border-slate-100">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                <CardTitle className="text-xl font-bold text-slate-800">📷 숙제 인증</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <HomeworkUpload onUpload={async (file) => console.log(file)} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
