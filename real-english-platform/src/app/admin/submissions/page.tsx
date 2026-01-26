import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllSubmissions } from "@/lib/actions/admin";
import { Headphones, BookOpen, Camera } from "lucide-react";
import SubmissionList from "@/components/admin/SubmissionList";

export const dynamic = 'force-dynamic';

export default async function SubmissionsPage() {
    const { listening, easy, quest } = await getAllSubmissions();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">숙제 제출 관리</h1>
                <p className="text-slate-500 mt-2">학생들의 숙제 제출 내역을 확인하고 관리할 수 있습니다.</p>
            </div>

            <Tabs defaultValue="listening" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="listening" className="flex items-center gap-2">
                        <Headphones className="w-4 h-4" />
                        듣기평가 ({listening.length})
                    </TabsTrigger>
                    <TabsTrigger value="easy" className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        쉬운문제 ({easy.length})
                    </TabsTrigger>
                    <TabsTrigger value="quest" className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        사진제출 ({quest.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="listening">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Headphones className="w-5 h-5 text-purple-600" />
                                듣기평가 제출 내역
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SubmissionList submissions={listening} type="listening" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="easy">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-orange-600" />
                                쉬운문제 제출 내역
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SubmissionList submissions={easy} type="easy" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="quest">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-green-600" />
                                사진 제출 내역 (영단어 등)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SubmissionList submissions={quest} type="quest" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
