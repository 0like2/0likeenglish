'use server';

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";
import { getUserProfile } from "@/lib/data/dashboard";

async function checkTeacherRole() {
    const user = await getUserProfile();
    if (user?.role !== 'teacher') {
        throw new Error('Unauthorized: Only teachers can perform this action.');
    }
}

// Helper to get admin client
function getAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing. Cannot perform admin operations.");
    }
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
    );
}

export async function seedBlogPosts() {
    try {
        await checkTeacherRole();
        const supabase = getAdminClient();

        const posts = [
            {
                title: "2024년 고3 수능 영어 분석 및 전략",
                content: `
                    <p>안녕하세요. 리얼잉글리쉬입니다.</p>
                    <p>2024학년도 수능 영어 영역 분석을 공유합니다.</p>
                    <h3>1. 출제 경향</h3>
                    <p>빈칸 추론과 순서 배열 문항의 난이도가 상승했습니다...</p>
                    <h3>2. 대비 전략</h3>
                    <p>EBS 연계율이 50%로 유지되었으나, 간접 연계 방식이 주를 이루었습니다.</p>
                `,
                category: "공지사항",
                is_published: true
            },
            {
                title: "[문법] 가정법 과거완료 핵심 정리",
                content: `
                    <p>가정법 과거완료는 과거 사실의 반대를 나타낼 때 사용합니다.</p>
                    <pre>If + S + had p.p, S + would/could/might + have p.p</pre>
                    <p>예시: If I had known, I would have told you.</p>
                `,
                category: "문법 자료",
                is_published: true
            },
            {
                title: "[듣기] 2023년 9월 모의고사 듣기 대본",
                content: "<p>듣기 파일 및 대본 다운로드는 첨부파일을 확인해주세요.</p>",
                category: "듣기 자료",
                is_published: true
            }
        ];

        let count = 0;
        for (const post of posts) {
            const { error } = await supabase.from('blog_posts').insert(post);
            if (!error) count++;
        }

        revalidatePath('/admin/blog');
        revalidatePath('/blog');

        return { success: true, message: `${count}개의 게시글이 복구되었습니다.` };
    } catch (error: any) {
        console.error("Seed Blog Error:", error);
        return { success: false, message: error.message };
    }
}

export async function seedStudents() {
    try {
        await checkTeacherRole();
        const supabase = getAdminClient();
        console.log("🌱 Seeding Students...");

        // 1. Classes
        const classes = [
            {
                name: '고1/2 내신 집중반 (목)',
                day_of_week: '목',
                start_time: '18:00',
                end_time: '22:00',
                price: 400000,
                is_active: true
            },
            {
                name: '고3 수능 대비 과외 (토)',
                day_of_week: '토',
                start_time: '13:00',
                end_time: '17:00',
                price: 600000,
                is_active: true
            }
        ];

        const classMap: Record<string, string> = {}; // Name -> ID

        for (const cls of classes) {
            const { data, error } = await supabase
                .from('classes')
                .upsert(cls, { onConflict: 'name' })
                .select()
                .single();

            if (data) classMap[cls.name] = data.id;
        }

        // 2. Users
        const users = [
            { email: 'nohdomi@example.com', name: '노도미', role: 'student', password: 'password123' },
            { email: 'jeonyoungseo@example.com', name: '전영서', role: 'student', password: 'password123' },
            { email: 'despair100@example.com', name: '특집100일의절망', role: 'student', password: 'password123' },
            { email: 'iyeonglag@example.com', name: '이영락', role: 'student', password: 'password123' }
        ];

        const userMap: Record<string, string> = {};

        for (const u of users) {
            // Create Auth User (Idempotent-ish check)
            // Admin API createUser throws if email exists.
            let userId;

            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true,
                user_metadata: { name: u.name, role: u.role }
            });

            if (authUser?.user) {
                userId = authUser.user.id;
            } else if (authError?.message?.includes("already registered") || authError) {
                // Try to fetch existing user from public table or admin API
                // Simplest: Check public table by email
                const { data: existing } = await supabase.from('users').select('id').eq('email', u.email).single();
                if (existing) userId = existing.id;
            }

            if (userId) {
                // Update Metadata to ensure name is correct if existed
                await supabase.auth.admin.updateUserById(userId, { user_metadata: { name: u.name, role: u.role } });

                // Upsert Public Profile
                await supabase.from('users').upsert({
                    id: userId,
                    email: u.email,
                    name: u.name,
                    role: u.role
                });
                userMap[u.name] = userId;
            }
        }

        // 3. Enrollments
        const enrollments = [
            { userName: '노도미', className: '고1/2 내신 집중반 (목)' },
            { userName: '전영서', className: '고3 수능 대비 과외 (토)' }
        ];

        for (const enr of enrollments) {
            const uid = userMap[enr.userName];
            const cid = classMap[enr.className];
            if (uid && cid) {
                await supabase.from('class_members').upsert({
                    student_id: uid,
                    class_id: cid,
                    status: 'active',
                    joined_at: new Date().toISOString()
                }, { onConflict: 'student_id,class_id' });
            }
        }

        // 4. Payments (Expired for all)
        for (const name of Object.keys(userMap)) {
            const uid = userMap[name];
            await supabase.from('payments').insert({
                student_id: uid,
                amount: 0,
                status: 'expired',
                payment_date: new Date('2025-12-18').toISOString(), // Use recent date from screenshot
                method: 'card'
            });
        }

        revalidatePath('/admin/students');
        revalidatePath('/admin');

        return { success: true, message: "학생 데이터가 복구되었습니다." };

    } catch (error: any) {
        console.error("Seed Students Error:", error);
        return { success: false, message: error.message };
    }
}

// --- Class Management Actions ---

async function syncQuests(supabase: any, classId: string, data: any) {
    // Helper to sync quests based on settings
    const quests = [
        { key: 'quest_vocab_on', title: '영단어 암기', freq: data.quest_frequencies?.vocab || data.quest_frequency || 3 },
        { key: 'quest_listening_on', title: '듣기평가', freq: data.quest_frequencies?.listening || data.quest_frequency || 3 },
        { key: 'quest_mock_on', title: '모의고사', freq: data.quest_frequencies?.mock || 1 }
    ];

    for (const q of quests) {
        if (data[q.key]) {
            // Quest should be active. Upsert by class_id + title (assuming title is unique per class)
            // Since we don't have a unique constraint on (class_id, title) known, we check first.
            const { data: existing } = await supabase.from('class_quests')
                .select('id')
                .eq('class_id', classId)
                .eq('title', q.title)
                .single();

            if (existing) {
                await supabase.from('class_quests').update({
                    weekly_frequency: q.freq,
                    is_active: true
                }).eq('id', existing.id);
            } else {
                await supabase.from('class_quests').insert({
                    class_id: classId,
                    title: q.title,
                    weekly_frequency: q.freq,
                    is_active: true
                });
            }
        } else {
            // Quest disabled. Deactivate or Delete? Let's Deactivate.
            const { data: existing } = await supabase.from('class_quests')
                .select('id')
                .eq('class_id', classId)
                .eq('title', q.title)
                .single();

            if (existing) {
                await supabase.from('class_quests').update({ is_active: false }).eq('id', existing.id);
            }
        }
    }
}

export async function createClass(formData: any) {
    try {
        await checkTeacherRole();
        const supabase = getAdminClient();

        const { data, error } = await supabase.from('classes').insert({
            name: formData.name,
            schedule: formData.schedule,
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            end_time: formData.end_time,
            price: formData.price,
            quest_vocab_on: formData.quest_vocab_on,
            quest_listening_on: formData.quest_listening_on,
            quest_mock_on: formData.quest_mock_on,
            quest_frequency: formData.quest_frequency,
            is_active: true
        }).select().single();

        if (error) throw error;

        // Sync Quests
        await syncQuests(supabase, data.id, formData);

        revalidatePath('/admin/classes');
        return { success: true, data };
    } catch (error: any) {
        console.error("Create Class Error:", error);
        return { success: false, message: error.message };
    }
}

export async function updateClass(classId: string, data: any) {
    try {
        await checkTeacherRole();
        const supabase = getAdminClient();

        // Determine general frequency from granular settings if available
        let quest_frequency = 3;
        if (data.quest_frequencies) {
            quest_frequency = data.quest_frequencies.vocab || data.quest_frequencies.listening || 3;
        }

        const updateData: any = {
            name: data.name,
            schedule: data.schedule,
            price: data.price,
            day_of_week: data.day_of_week,
            start_time: data.start_time,
            end_time: data.end_time,
            quest_vocab_on: data.quest_vocab_on,
            quest_listening_on: data.quest_listening_on,
            quest_mock_on: data.quest_mock_on,
        };

        if (data.quest_frequencies) {
            updateData.quest_frequency = quest_frequency;
        }

        const { error } = await supabase
            .from('classes')
            .update(updateData)
            .eq('id', classId);

        if (error) throw error;

        // Sync Quests
        // We need to merge settings into 'data' for syncQuests to work if they are split
        await syncQuests(supabase, classId, data);

        revalidatePath('/admin/classes');
        revalidatePath(`/admin/classes/${classId}`);
        revalidatePath(`/class/${classId}`);

        return { success: true };
    } catch (error: any) {
        console.error("Update Class Error:", error);
        throw new Error(error.message);
    }
}

export async function deleteClass(classId: string) {
    try {
        await checkTeacherRole();
        const supabase = getAdminClient();
        const { error } = await supabase.from('classes').delete().eq('id', classId);

        if (error) throw error;

        revalidatePath('/admin/classes');
        return { success: true };
    } catch (error: any) {
        console.error("Delete Class Error:", error);
        throw new Error(error.message);
    }
}

export async function getLastQuestSettings(classId: string) {
    // Helper to get granular settings from class_quests if available
    // Because 'classes' table only has 1 freq column.
    return getClassSettings(classId);
}

export async function getClassSettings(classId: string) {
    const supabase = await createClient();

    // Fetch from class_quests directly to get granular data!
    const { data: quests } = await supabase.from('class_quests')
        .select('*')
        .eq('class_id', classId);

    const settings = { vocab_freq: 3, listening_freq: 3, mock_freq: 1 };

    if (quests && quests.length > 0) {
        const vocab = quests.find((q: any) => q.title === '영단어 암기');
        const listening = quests.find((q: any) => q.title === '듣기평가');
        const mock = quests.find((q: any) => q.title === '모의고사');

        if (vocab) settings.vocab_freq = vocab.weekly_frequency;
        if (listening) settings.listening_freq = listening.weekly_frequency;
        if (mock) settings.mock_freq = mock.weekly_frequency;
    } else {
        // Fallback to classes table
        const { data } = await supabase.from('classes').select('quest_frequency').eq('id', classId).single();
        if (data) {
            settings.vocab_freq = data.quest_frequency;
            settings.listening_freq = data.quest_frequency;
        }
    }

    return settings;
}

export async function assignClass(studentId: string, classId: string) {
    try {
        await checkTeacherRole();
        const supabase = getAdminClient();
        const { error } = await supabase.from('class_members').upsert({
            student_id: studentId,
            class_id: classId,
            status: 'active',
            joined_at: new Date().toISOString()
        }, { onConflict: 'student_id,class_id' });

        if (error) throw error;

        revalidatePath('/admin/students');
        return { success: true };
    } catch (error: any) {
        console.error("Assign Class Error:", error);
        throw new Error(error.message);
    }
}

// --- Blog Management Actions ---

export async function createBlogPost(data: {
    title: string;
    content: string;
    category: string;
    is_published: boolean;
}) {
    try {
        await checkTeacherRole();
        const supabase = getAdminClient();

        const { error } = await supabase.from('blog_posts').insert({
            title: data.title,
            content: data.content,
            category: data.category,
            is_published: data.is_published,
            created_at: new Date().toISOString()
        });

        if (error) throw error;

        revalidatePath('/admin/blog');
        revalidatePath('/blog');
        return { success: true };
    } catch (error: any) {
        console.error("Create Blog Post Error:", error);
        return { success: false, message: error.message };
    }
}
export async function updateBlogPost(postId: string, data: {
    title: string;
    content: string;
    category: string;
    is_published: boolean;
}) {
    try {
        await checkTeacherRole();
        const supabase = getAdminClient();

        const { error } = await supabase.from('blog_posts').update({
            title: data.title,
            content: data.content,
            category: data.category,
            is_published: data.is_published,
            updated_at: new Date().toISOString()
        }).eq('id', postId);

        if (error) throw error;

        revalidatePath('/admin/blog');
        revalidatePath('/blog');
        return { success: true };
    } catch (error: any) {
        console.error("Update Blog Post Error:", error);
        return { success: false, message: error.message };
    }
}

export async function deleteBlogPost(postId: string) {
    try {
        await checkTeacherRole();
        const supabase = getAdminClient();
        const { error } = await supabase.from('blog_posts').delete().eq('id', postId);

        if (error) throw error;

        revalidatePath('/admin/blog');
        revalidatePath('/blog');
        return { success: true };
    } catch (error: any) {
        console.error("Delete Blog Post Error:", error);
        return { success: false, message: error.message };
    }
}
