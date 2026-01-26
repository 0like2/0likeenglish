import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, GraduationCap, Users } from "lucide-react";
import AssignClassDialog from "@/components/admin/AssignClassDialog";
import PaymentManageDialog from "@/components/admin/PaymentManageDialog";
import UnassignClassButton from "@/components/admin/UnassignClassButton";
import { getStudentsData, getClassesData, getParentsData } from "@/lib/data/admin";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function StudentManagementPage() {
    const [students, classes, parents] = await Promise.all([
        getStudentsData({ includeTestAccounts: false }),
        getClassesData(),
        getParentsData()
    ]);

    // 테스트 계정 제외
    const realParents = parents.filter((p: any) => !p.isTestAccount);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">회원 관리</h1>
                <p className="text-slate-500 mt-2">수강생 및 학부모 목록을 조회하고 관리합니다.</p>
            </div>

            <Tabs defaultValue="students" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="students" className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        수강생 ({students.length}명)
                    </TabsTrigger>
                    <TabsTrigger value="parents" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        학부모 ({realParents.length}명)
                    </TabsTrigger>
                </TabsList>

                {/* 수강생 탭 */}
                <TabsContent value="students">
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
                                        <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <div className="flex flex-col">
                                                    <span>{student.name}</span>
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
                </TabsContent>

                {/* 학부모 탭 */}
                <TabsContent value="parents">
                    <Card>
                        <CardHeader>
                            <CardTitle>학부모 목록 ({realParents.length}명)</CardTitle>
                            <CardDescription>등록된 학부모 계정과 연결된 자녀 정보입니다.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3">이름</th>
                                            <th className="px-6 py-3">이메일</th>
                                            <th className="px-6 py-3">연결된 자녀</th>
                                            <th className="px-6 py-3">가입일</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {realParents.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center py-8 text-slate-500">
                                                    등록된 학부모가 없습니다.
                                                </td>
                                            </tr>
                                        ) : (
                                            realParents.map((parent: any) => (
                                                <tr key={parent.id} className="bg-white border-b hover:bg-slate-50">
                                                    <td className="px-6 py-4 font-medium text-slate-900">
                                                        {parent.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">
                                                        {parent.email}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {parent.linkedCount === 0 ? (
                                                            <Badge variant="outline" className="text-slate-400 border-dashed">연결 없음</Badge>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-1">
                                                                {parent.linkedChildren.map((child: any) => (
                                                                    <Badge key={child.id} variant="secondary" className="bg-green-50 text-green-700">
                                                                        {child.name}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">
                                                        {parent.createdAt}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
