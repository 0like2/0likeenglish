"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Headphones, BookOpen, Camera, User, ChevronRight, Loader2 } from "lucide-react";
import { getStudentsWithSubmissionCounts, getSubmissionsByStudent } from "@/lib/actions/admin";
import StudentSubmissionList from "@/components/admin/StudentSubmissionList";

interface StudentWithCounts {
    id: string;
    name: string;
    email: string;
    counts: { listening: number; easy: number; quest: number };
    totalCount: number;
}

export default function SubmissionsPage() {
    const [students, setStudents] = useState<StudentWithCounts[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentWithCounts | null>(null);
    const [submissions, setSubmissions] = useState<{ listening: any[]; easy: any[]; quest: any[] }>({
        listening: [],
        easy: [],
        quest: []
    });
    const [loading, setLoading] = useState(true);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    useEffect(() => {
        loadStudents();
    }, []);

    async function loadStudents() {
        setLoading(true);
        const data = await getStudentsWithSubmissionCounts();
        setStudents(data);
        setLoading(false);
    }

    async function handleSelectStudent(student: StudentWithCounts) {
        setSelectedStudent(student);
        setLoadingSubmissions(true);
        const data = await getSubmissionsByStudent(student.id);
        setSubmissions(data);
        setLoadingSubmissions(false);
    }

    async function refreshSubmissions() {
        if (selectedStudent) {
            const data = await getSubmissionsByStudent(selectedStudent.id);
            setSubmissions(data);
        }
        loadStudents();
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">숙제 제출 관리</h1>
                <p className="text-slate-500 mt-2">학생을 선택하여 제출 내역을 확인하고 관리할 수 있습니다.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Student List */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        학생 목록 ({students.length}명)
                    </h2>
                    {students.length === 0 ? (
                        <Card className="p-8 text-center text-slate-400">
                            제출 내역이 있는 학생이 없습니다.
                        </Card>
                    ) : (
                        <ScrollArea className="h-[600px]">
                            <div className="space-y-2 pr-4">
                                {students.map((student) => (
                                    <Card
                                        key={student.id}
                                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                                            selectedStudent?.id === student.id
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-slate-200"
                                        }`}
                                        onClick={() => handleSelectStudent(student)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-medium text-slate-900 truncate">{student.name}</h3>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                    <Badge variant="outline" className="text-purple-600 bg-purple-50">
                                                        <Headphones className="w-3 h-3 mr-1" />
                                                        {student.counts.listening}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-orange-600 bg-orange-50">
                                                        <BookOpen className="w-3 h-3 mr-1" />
                                                        {student.counts.easy}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-green-600 bg-green-50">
                                                        <Camera className="w-3 h-3 mr-1" />
                                                        {student.counts.quest}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {/* Right: Submissions by Type */}
                <div className="lg:col-span-2">
                    {selectedStudent ? (
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    {selectedStudent.name}의 제출 내역
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingSubmissions ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                    </div>
                                ) : (
                                    <Tabs defaultValue="listening" className="w-full">
                                        <TabsList className="grid w-full grid-cols-3 mb-4">
                                            <TabsTrigger value="listening" className="flex items-center gap-2">
                                                <Headphones className="w-4 h-4" />
                                                듣기 ({submissions.listening.length})
                                            </TabsTrigger>
                                            <TabsTrigger value="easy" className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4" />
                                                쉬운문제 ({submissions.easy.length})
                                            </TabsTrigger>
                                            <TabsTrigger value="quest" className="flex items-center gap-2">
                                                <Camera className="w-4 h-4" />
                                                사진 ({submissions.quest.length})
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="listening">
                                            <StudentSubmissionList
                                                submissions={submissions.listening}
                                                type="listening"
                                                onRefresh={refreshSubmissions}
                                            />
                                        </TabsContent>

                                        <TabsContent value="easy">
                                            <StudentSubmissionList
                                                submissions={submissions.easy}
                                                type="easy"
                                                onRefresh={refreshSubmissions}
                                            />
                                        </TabsContent>

                                        <TabsContent value="quest">
                                            <StudentSubmissionList
                                                submissions={submissions.quest}
                                                type="quest"
                                                onRefresh={refreshSubmissions}
                                            />
                                        </TabsContent>
                                    </Tabs>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="p-12 text-center text-slate-400">
                            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>왼쪽에서 학생을 선택하세요.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
