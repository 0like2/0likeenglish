import { createClient } from "@/lib/supabase/server";

export async function getClassLessons(classId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('class_id', classId)
        .order('date', { ascending: false });

    if (error) {
        console.error("Error fetching lessons:", error);
        return [];
    }
    return data;
}

export async function getStudentLessonChecks(studentId: string, classId: string) {
    const supabase = await createClient();
    const { data: lessons } = await supabase.from('lesson_plans').select('id').eq('class_id', classId);
    if (!lessons || lessons.length === 0) return [];

    const { data: checks } = await supabase
        .from('student_lesson_checks')
        .select('*')
        .eq('student_id', studentId)
        .in('lesson_id', lessons.map(l => l.id));

    return checks || [];
}

export async function getClassDetails(classId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
    return data;
}

export async function getLessonDetails(classId: string, date: string) {
    const supabase = await createClient();
    // Decode date if needed, or assume YYYY-MM-DD
    const { data } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('class_id', classId)
        .eq('date', date)
        .single();


    return data;
}

export async function getClassQuests(classId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('class_quests')
        .select('*')
        .eq('class_id', classId)
        .eq('is_active', true)
        .order('title', { ascending: true });

    return data || [];
}
