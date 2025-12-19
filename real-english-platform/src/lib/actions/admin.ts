'use server';

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";

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
                    user_id: uid,
                    class_id: cid,
                    status: 'active',
                    joined_at: new Date().toISOString()
                }, { onConflict: 'user_id,class_id' });
            }
        }

        // 4. Payments (Expired for all)
        for (const name of Object.keys(userMap)) {
            const uid = userMap[name];
            await supabase.from('payments').insert({
                user_id: uid,
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
