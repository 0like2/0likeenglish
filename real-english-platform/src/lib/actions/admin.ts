'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// --- Mutations Only ---

export async function assignClass(studentId: string, classId: string) {
    // Use Admin Client if available for robustness
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let supabase;

    if (serviceRoleKey) {
        supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
        );
    } else {
        supabase = await createClient();
    }

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
    quest_listening_on?: boolean;
    quest_mock_on?: boolean;
    quest_frequency?: number;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: newClass, error: classError } = await supabase
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
            quest_mock_on: formData.quest_mock_on ?? false,
            quest_frequency: formData.quest_frequency ?? 3
        })
        .select()
        .single();

    if (classError) throw new Error(classError.message);

    // 2. Create Default Quests
    const questsToInsert = [];
    if (formData.quest_vocab_on) {
        questsToInsert.push({
            class_id: newClass.id,
            type: 'Vocabulary',
            title: '매일 영단어 암기 인증',
            description: '오늘 외운 단어를 사진 찍어 올려주세요.',
            weekly_frequency: formData.quest_frequency ?? 3
        });
    }
    if (formData.quest_listening_on) {
        questsToInsert.push({
            class_id: newClass.id,
            type: 'Listening',
            title: '매일 듣기 평가 인증',
            description: '듣기 평가 수행 결과를 사진 찍어 올려주세요.',
            weekly_frequency: formData.quest_frequency ?? 3
        });
    }
    if (formData.quest_mock_on) {
        questsToInsert.push({
            class_id: newClass.id,
            type: 'MockExam',
            title: '주간 모의고사 풀이 인증',
            description: '모의고사 풀이 및 오답노트 사진을 올려주세요.',
            weekly_frequency: 1 // Mock exams are usually once a week or separate freq? User said "Frequency based". I'll default to 1 for Mock.
        });
    }

    if (questsToInsert.length > 0) {
        const { error: questError } = await supabase.from('class_quests').insert(questsToInsert);
        if (questError) console.error("Error creating default quests:", questError);
    }

    revalidatePath('/admin/classes');
}


export async function updateClass(classId: string, formData: {
    name: string,
    schedule: string,
    price: number,
    day_of_week?: string,
    start_time?: string,
    end_time?: string,
    quest_vocab_on?: boolean,
    quest_listening_on?: boolean;
    quest_mock_on?: boolean;
    quest_frequency?: number;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // 1. Update Class Details
    const { error: classError } = await supabase
        .from('classes')
        .update({
            name: formData.name,
            schedule: formData.schedule,
            price: formData.price,
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            end_time: formData.end_time,
            quest_vocab_on: formData.quest_vocab_on ?? true,
            quest_listening_on: formData.quest_listening_on ?? true,
            quest_mock_on: formData.quest_mock_on ?? false,
            quest_frequency: formData.quest_frequency ?? 3
        })
        .eq('id', classId);

    if (classError) throw new Error(classError.message);

    // 2. Sync Quests
    const syncQuest = async (type: string, title: string, desc: string, isOn: boolean, freq: number) => {
        // Check existing
        const { data: existing } = await supabase
            .from('class_quests')
            .select('*')
            .eq('class_id', classId)
            .eq('type', type)
            .single();

        if (isOn) {
            if (existing) {
                // Update and Activate
                await supabase.from('class_quests').update({
                    is_active: true,
                    weekly_frequency: freq,
                    title: title,
                    description: desc
                }).eq('id', existing.id);
            } else {
                // Create
                await supabase.from('class_quests').insert({
                    class_id: classId,
                    type: type,
                    title: title,
                    description: desc,
                    weekly_frequency: freq,
                    is_active: true
                });
            }
        } else {
            if (existing) {
                // Deactivate
                await supabase.from('class_quests').update({
                    is_active: false
                }).eq('id', existing.id);
            }
        }
    };

    await syncQuest('Vocabulary', '매일 영단어 암기 인증', '오늘 외운 단어를 사진 찍어 올려주세요.', formData.quest_vocab_on ?? true, formData.quest_frequency ?? 3);
    await syncQuest('Listening', '매일 듣기 평가 인증', '듣기 평가 수행 결과를 사진 찍어 올려주세요.', formData.quest_listening_on ?? true, formData.quest_frequency ?? 3);
    await syncQuest('MockExam', '주간 모의고사 풀이 인증', '모의고사 풀이 및 오답노트 사진을 올려주세요.', formData.quest_mock_on ?? false, 1);

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

export async function deleteClass(classId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // 1. Delete Dependencies (Manual Cascade for safety)

    // Quests
    const { data: quests } = await supabase.from('class_quests').select('id').eq('class_id', classId);
    if (quests && quests.length > 0) {
        const questIds = quests.map(q => q.id);
        // Clean up quest related tables if they exist (submissions, progress)
        await supabase.from('quest_submissions').delete().in('quest_id', questIds);
        await supabase.from('student_quest_progress').delete().in('quest_id', questIds);

        await supabase.from('class_quests').delete().eq('class_id', classId);
    }

    // Lessons
    const { data: lessons } = await supabase.from('lesson_plans').select('id').eq('class_id', classId);
    if (lessons && lessons.length > 0) {
        const lessonIds = lessons.map(l => l.id);
        await supabase.from('student_lesson_checks').delete().in('lesson_id', lessonIds);
        await supabase.from('lesson_plans').delete().eq('class_id', classId);
    }

    // Members
    await supabase.from('class_members').delete().eq('class_id', classId);

    // 2. Delete Class
    const { error } = await supabase.from('classes').delete().eq('id', classId);

    if (error) throw new Error(error.message);

    revalidatePath('/admin/classes');
}
