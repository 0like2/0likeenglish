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
