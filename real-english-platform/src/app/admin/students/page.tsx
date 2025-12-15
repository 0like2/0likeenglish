import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import AssignClassDialog from "@/components/admin/AssignClassDialog";
import { getStudentsData, getClassesData } from "@/lib/data/admin";
import StudentListFilters from "@/components/admin/StudentListFilters";

export const dynamic = 'force-dynamic';

export default async function StudentManagementPage() {
    const students = await getStudentsData();
    const classes = await getClassesData(); // Fetch classes for dropdown

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">학생 관리</h1>
                <p className="text-slate-500 mt-2">수강생 목록을 조회하고 수업을 배정합니다.</p>
            </div>

            <StudentListFilters />

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
                                    students.map((student) => (
                                        <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <div className="flex flex-col">
                                                    <span>{student.name}</span>
                                                    <span className="text-xs text-slate-400 font-normal">{student.school}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.class === "미배정" ? (
                                                    <Badge variant="outline" className="text-slate-400 border-dashed">미배정</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">{student.class}</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.paymentStatus === 'active' && <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">수강중</Badge>}
                                                {student.paymentStatus === 'warning' && <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0">마감임박</Badge>}
                                                {student.paymentStatus === 'expired' && <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">만료됨</Badge>}
                                                {student.paymentStatus === 'pending' && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">입금확인중</Badge>}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{student.lastActive}</td>
                                            <td className="px-6 py-4 flex items-center gap-2">
                                                <AssignClassDialog
                                                    studentName={student.name}
                                                    studentId={student.id}
                                                    classes={classes} // Pass fetched classes
                                                />
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
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
