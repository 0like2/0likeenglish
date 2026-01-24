import { createClient } from "@/lib/supabase/server";

export async function getClassLessons(classId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('lesson_plans')
        .select(`
            *,
            exams (id, title, category)
        `)
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

export async function getClassExams(classId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch Exams
    const { data: exams } = await supabase
        .from('class_exams')
        .select('*')
        .eq('class_id', classId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (!exams || exams.length === 0) return [];

    let submissions: any[] = [];
    if (user) {
        // 2. Fetch User Submissions
        const { data: subs } = await supabase
            .from('exam_submissions')
            .select('*')
            .eq('student_id', user.id)
            .in('exam_id', exams.map(e => e.id));
        submissions = subs || [];
    }

    // 3. Merge
    return exams.map(exam => {
        const submission = submissions.find(s => s.exam_id === exam.id);
        return {
            ...exam,
            submission // undefined if not taken
        };
    });
}
