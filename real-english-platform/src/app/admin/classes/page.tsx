import CreateClassForm from "@/components/admin/CreateClassForm";
import ManageLessonsDialog from "@/components/admin/ManageLessonsDialog";
import EditClassDialog from "@/components/admin/EditClassDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";
import Link from "next/link";
import { getClassesData } from "@/lib/data/admin";

import DeleteClassButton from "@/components/admin/DeleteClassButton";

export const dynamic = 'force-dynamic';

export default async function ClassManagementPage() {
    const classes = await getClassesData();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">수업/반 관리</h1>
                    <p className="text-slate-500 mt-2">새로운 수업을 개설하거나 기존 수업에 과제를 등록합니다.</p>
                </div>
                {/* Create Class Button */}
                <CreateClassForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        개설된 수업이 없습니다. 새 수업을 만들어보세요!
                    </div>
                )}
                {classes.map((cls) => (
                    <Card key={cls.id} className="flex flex-col group hover:shadow-lg transition-shadow bg-white">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-100">수강중</Badge>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900">₩{cls.price.toLocaleString()}</span>
                                    <EditClassDialog classData={cls} />
                                    <DeleteClassButton classId={cls.id} className={cls.name} />
                                </div>
                            </div>
                            <Link href={`/admin/classes/${cls.id}`} className="block">
                                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{cls.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" /> {cls.schedule}
                                </CardDescription>
                            </Link>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <Link href={`/admin/classes/${cls.id}`} className="block">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Users className="w-4 h-4" />
                                    <div className="flex items-center gap-2">
                                        <span>수강생 {cls.students}명</span>
                                    </div>
                                </div>
                            </Link>
                        </CardContent>
                        <CardFooter className="pt-4 border-t bg-slate-50/50 flex justify-between gap-2">
                            <Link href={`/admin/classes/${cls.id}`} className="w-full">
                                <Button variant="outline" size="sm" className="w-full gap-2 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                                    관리 및 로그 등록
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
