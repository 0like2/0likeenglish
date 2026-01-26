import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart2, FlaskConical } from "lucide-react";
import AssignClassDialog from "@/components/admin/AssignClassDialog";
import PaymentManageDialog from "@/components/admin/PaymentManageDialog";
import UnassignClassButton from "@/components/admin/UnassignClassButton";
import { getStudentsData, getClassesData } from "@/lib/data/admin";
import StudentListFilters from "@/components/admin/StudentListFilters";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ showTest?: string }>;
}

export default async function StudentManagementPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const showTestAccounts = params.showTest === 'true';
    const students = await getStudentsData({ includeTestAccounts: showTestAccounts });
    const classes = await getClassesData(); // Fetch classes for dropdown

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">학생 관리</h1>
                <p className="text-slate-500 mt-2">수강생 목록을 조회하고 수업을 배정합니다.</p>
            </div>

            <Suspense fallback={<div>로딩중...</div>}>
                <StudentListFilters />
            </Suspense>

            <Card>
                <CardHeader>
                    <CardTitle>수강생 목록 ({students.length}명)</CardTitle>
                    <CardDescription>전체 학생의 수강 상태 및 결제 현황입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">이름/학교</th>
                                    <th className="px-6 py-3">현재 수강 반</th>
                                    <th className="px-6 py-3">수강권 상태</th>
                                    <th className="px-6 py-3">최근 활동</th>
                                    <th className="px-6 py-3">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-slate-500">
                                            등록된 학생이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student: any) => (
                                        <tr key={student.id} className={`border-b hover:bg-slate-50 ${student.isTestAccount ? 'bg-amber-50/50' : 'bg-white'}`}>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <div className="flex flex-col">
                                                    <span className="flex items-center gap-1">
                                                        {student.name}
                                                        {student.isTestAccount && (
                                                            <span title="테스트 계정">
                                                                <FlaskConical className="w-3 h-3 text-amber-500" />
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-normal">{student.school}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {student.class === "미배정" ? (
                                                        <Badge variant="outline" className="text-slate-400 border-dashed">미배정</Badge>
                                                    ) : (
                                                        <>
                                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">{student.class}</Badge>
                                                            <UnassignClassButton
                                                                studentId={student.id}
                                                                studentName={student.name}
                                                                classId={student.classId}
                                                                className={student.class}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.paymentStatus === 'active' && <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">수강중</Badge>}
                                                {student.paymentStatus === 'warning' && <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0">마감임박</Badge>}
                                                {student.paymentStatus === 'expired' && <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">만료됨</Badge>}
                                                {student.paymentStatus === 'pending' && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">입금확인중</Badge>}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{student.lastActive}</td>
                                            <td className="px-6 py-4 flex items-center gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/students/${student.id}`}>
                                                        <BarChart2 className="w-4 h-4 mr-1" />
                                                        분석
                                                    </Link>
                                                </Button>
                                                <AssignClassDialog
                                                    studentName={student.name}
                                                    studentId={student.id}
                                                    classes={classes}
                                                />
                                                <PaymentManageDialog
                                                    studentId={student.id}
                                                    studentName={student.name}
                                                    currentStatus={student.paymentStatus}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
