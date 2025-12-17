import WeeklyScheduler from "@/components/schedule/WeeklyScheduler";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export default async function SchedulePage() {
    const supabase = await createClient();
    const { data: classes } = await supabase.from('classes').select('*').eq('is_active', true);

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container px-4 md:px-6 space-y-8">
                <div className="text-center space-y-4">
                    <Badge variant="outline" className="border-blue-200 text-blue-600 bg-white">
                        Class Schedule
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        나의 수업 시간표
                    </h1>
                    <p className="text-lg text-slate-500">
                        진행 중인 수업을 클릭하면 상세 페이지로 이동합니다.
                    </p>
                </div>

                <WeeklyScheduler classes={classes || []} />
            </div>
        </div>
    );
}
