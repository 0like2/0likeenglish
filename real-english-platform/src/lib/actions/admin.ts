'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// --- Mutations Only ---

export async function assignClass(studentId: string, classId: string) {
    const supabase = await createClient();

    // Deactivate old active classes
    await supabase
        .from('class_members')
        .update({ status: 'ended' })
        .eq('student_id', studentId)
        .eq('status', 'active');

    // Insert new
    const { error } = await supabase
        .from('class_members')
        .insert({
            student_id: studentId,
            class_id: classId,
            status: 'active'
        });

    if (error) throw new Error(error.message);
    revalidatePath('/admin/students');
}

export async function createClass(formData: {
    name: string,
    schedule: string,
    price: number,
    day_of_week?: string,
    start_time?: string,
    end_time?: string,
    quest_vocab_on?: boolean,
    quest_listening_on?: boolean,
    quest_frequency?: number
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('classes')
        .insert({
            teacher_id: user.id,
            name: formData.name,
            schedule: formData.schedule,
            price: formData.price,
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            end_time: formData.end_time,
            quest_vocab_on: formData.quest_vocab_on ?? true,
            quest_listening_on: formData.quest_listening_on ?? true,
            quest_frequency: formData.quest_frequency ?? 3
        });

    if (error) throw new Error(error.message);
    revalidatePath('/admin/classes');
}

export async function createBlogPost(data: { title: string, content: string, category: string, is_published: boolean }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('blog_posts')
        .insert({
            teacher_id: user.id,
            title: data.title,
            content: data.content,
            category: data.category,
            is_published: data.is_published
        });

    if (error) throw new Error(error.message);
    revalidatePath('/admin/blog');
    // We don't redirect here, let client handle it or redirect?
    // Client side usually handles redirect after success
}
