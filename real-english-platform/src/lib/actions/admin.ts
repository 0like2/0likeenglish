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
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, message: "로그인이 필요합니다." };

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
                quest_frequency: formData.quest_frequency ?? 3,
                is_active: true // Ensure class is active by default
            })
            .select()
            .single();

        if (classError) {
            console.error("Create Class Error:", classError);
            return { success: false, message: `수업 등록 실패: ${classError.message}` };
        }

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
        return { success: true };
    } catch (e: any) {
        console.error("Unexpected error:", e);
        return { success: false, message: "알 수 없는 오류가 발생했습니다." };
    }
}




export async function getClassSettings(classId: string) {
    const supabase = await createClient();

    // Fetch class with quests
    const { data: classData, error } = await supabase
        .from('classes')
        .select(`
            *,
            class_quests (
                type,
                weekly_frequency,
                is_active
            )
        `)
        .eq('id', classId)
        .single();

    if (error) throw new Error(error.message);

    // Transform to friendly format
    const settings = {
        vocab_freq: classData.class_quests?.find((q: any) => q.type === 'Vocabulary')?.weekly_frequency || 3,
        listening_freq: classData.class_quests?.find((q: any) => q.type === 'Listening')?.weekly_frequency || 3,
        mock_freq: classData.class_quests?.find((q: any) => q.type === 'MockExam')?.weekly_frequency || 1,
    };

    return settings;
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
    quest_frequency?: number; // Legacy global fallback
    quest_frequencies?: {
        vocab: number;
        listening: number;
        mock: number;
    }
}) {
    // Use Admin Client if available for robustness (UPDATED)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let supabase;

    if (serviceRoleKey) {
        supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
        );
    } else {
        const adminClient = await createClient();
        const { data: { user } } = await adminClient.auth.getUser(); // Only check auth if using client rls
        if (!user) throw new Error("Unauthorized");
        supabase = adminClient;
    }

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
            quest_frequency: formData.quest_frequency ?? 3,
            is_active: true // Force active on update
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

    // Use individual frequencies if provided, else fallback
    const freqs = formData.quest_frequencies || {
        vocab: formData.quest_frequency || 3,
        listening: formData.quest_frequency || 3,
        mock: 1
    };

    await syncQuest('Vocabulary', '매일 영단어 암기 인증', '오늘 외운 단어를 사진 찍어 올려주세요.', formData.quest_vocab_on ?? true, freqs.vocab);
    await syncQuest('Listening', '매일 듣기 평가 인증', '듣기 평가 수행 결과를 사진 찍어 올려주세요.', formData.quest_listening_on ?? true, freqs.listening);
    await syncQuest('MockExam', '주간 모의고사 풀이 인증', '모의고사 풀이 및 오답노트 사진을 올려주세요.', formData.quest_mock_on ?? false, freqs.mock);

    revalidatePath('/admin/classes');
}

export async function createBlogPost(data: { title: string, content: string, category: string, is_published: boolean }) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, message: "로그인이 필요합니다." };

        const { error } = await supabase
            .from('blog_posts')
            .insert({
                teacher_id: user.id,
                title: data.title,
                content: data.content,
                category: data.category,
                is_published: data.is_published
            });

        if (error) {
            console.error("Create Blog Post Error:", error);
            return { success: false, message: `등록 실패: ${error.message}` };
        }

        revalidatePath('/admin/blog');
        return { success: true };
    } catch (e: any) {
        console.error("Unexpected error:", e);
        return { success: false, message: "알 수 없는 오류가 발생했습니다." };
    }
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

export async function seedBlogPosts() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, message: "로그인이 필요합니다." };

        const samplePosts = [
            {
                title: "[문법] 관계대명사와 관계부사의 완벽 정리",
                category: "grammar",
                content: `
# 관계대명사 vs 관계부사

영어 문법에서 가장 헷갈리는 부분 중 하나인 관계사와 관계부사를 정리해봅니다.

## 1. 관계대명사 (Relative Pronoun)
- **종류**: who, which, that
- **역할**: 접속사 + 대명사
- **특징**: 뒤에 불완전한 문장이 옴 (주어나 목적어가 없음)

예문:
> This is the house **which** I bought. (동사 bought의 목적어가 없음)

## 2. 관계부사 (Relative Adverb)
- **종류**: where, when, why, how
- **역할**: 접속사 + 부사
- **특징**: 뒤에 완전한 문장이 옴

예문:
> This is the house **where** I live. (live는 자동사로 문장이 완전함)

## 핵심 구분법
뒤에 오는 문장이 **완전하면 관계부사**, **불완전하면 관계대명사**를 씁니다.
                `,
                is_published: true,
                teacher_id: user.id
            },
            {
                title: "[어휘] 수능 1등급을 위한 필수 유의어/반의어 모음",
                category: "voca",
                content: `
# 수능 필수 유의어 정리

## 1. '중요한' (Important)
- significant
- crucial
- vital
- essential
- critical

## 2. '줄이다' (Decrease)
- diminish
- reduce
- lessen
- curtail
- shrink

## 3. '발생하다' (Happen)
- occur
- take place
- arise
- come about

이 단어들은 지문에서 패러프레이징(Paraphrasing)될 때 자주 사용되니 꼭 암기하세요!
                `,
                is_published: true,
                teacher_id: user.id
            },
            {
                title: "[듣기] 쉐도잉 연습을 위한 추천 미드 5선",
                category: "listening",
                content: `
# 쉐도잉하기 좋은 미드 추천

1. **Friends (프렌즈)**
   - 일상 대화가 많고 발음이 비교적 정확함. 초보자 추천.

2. **Modern Family (모던 패밀리)**
   - 다양한 연령대의 영어를 접할 수 있음. 실생활 표현 가득.

3. **Emily in Paris (에밀리 파리에 가다)**
   - 비즈니스 영어와 일상 영어가 적절히 섞여 있음.

## 쉐도잉 팁
- 한 문장을 10번 이상 반복해서 입에 붙을 때까지 연습하세요.
- 자막 없이 들릴 때까지 반복하는 것이 중요합니다.
                `,
                is_published: true,
                teacher_id: user.id
            },
            {
                title: "[시험자료] 2024 고3 3월 모의고사 영어 분석 자료",
                category: "exam",
                content: `
# 3월 모의고사 총평

이번 3월 모의고사는 빈칸 추론이 다소 까다로웠습니다.

## 주요 킬러 문항
- **31번 (빈칸)**: 문맥상의 동의어를 찾는 능력이 요구됨.
- **34번 (빈칸)**: 철학적 지문으로 해석이 난해했음.
- **39번 (문장 삽입)**: 흐름의 단절을 찾는 것이 핵심.

## 향후 학습 방향
EBS 연계교재(수능특강) 단어 암기를 철저히 하고, 구문 독해 연습 비중을 늘려야 합니다.
                `,
                is_published: true,
                teacher_id: user.id
            },
            {
                title: "[공지] 2월 설날 연휴 휴강 안내",
                category: "notice",
                content: `
안녕하세요, Real English입니다.

다가오는 민족 대명절 설날을 맞아 학원 휴강 일정을 안내드립니다.

- **휴강 기간**: 2월 9일(금) ~ 2월 12일(월)
- **정상 수업**: 2월 13일(화)부터

즐거운 명절 보내시고, 재충전해서 만나요!
                `,
                is_published: true,
                teacher_id: user.id
            }
        ];

        const { error } = await supabase.from('blog_posts').insert(samplePosts);

        if (error) {
            console.error("Seeding Error:", error);
            return { success: false, message: error.message };
        }

        revalidatePath('/admin/blog');
        revalidatePath('/blog');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: "Unknown error" };
    }
}
