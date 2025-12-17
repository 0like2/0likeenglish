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

export async function getClassDetails(classId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
    return data;
}
