'use server';

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
}

// 질문 작성 (학생용)
export async function createQuestion(data: {
    title: string;
    content: string;
    category?: string;
}) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, message: "로그인이 필요합니다." };
        }

        const adminClient = getAdminClient();

        const { error } = await adminClient.from('qna_posts').insert({
            student_id: user.id,
            title: data.title,
            content: data.content,
            is_private: true
        });

        if (error) {
            console.error("Create question error:", error);
            return { success: false, message: error.message };
        }

        revalidatePath('/qna');
        revalidatePath('/admin/qna');

        return { success: true, message: "질문이 등록되었습니다." };
    } catch (error: any) {
        console.error("Create question error:", error);
        return { success: false, message: "질문 등록 중 오류가 발생했습니다." };
    }
}

// 답변 작성 (선생님용)
export async function answerQuestion(questionId: string, answer: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, message: "로그인이 필요합니다." };
        }

        // 선생님 권한 확인
        const role = user.user_metadata?.role;
        if (role !== 'teacher') {
            return { success: false, message: "선생님만 답변할 수 있습니다." };
        }

        const adminClient = getAdminClient();

        const { error } = await adminClient
            .from('qna_posts')
            .update({ answer })
            .eq('id', questionId);

        if (error) {
            console.error("Answer question error:", error);
            return { success: false, message: error.message };
        }

        revalidatePath('/admin/qna');

        return { success: true, message: "답변이 등록되었습니다." };
    } catch (error: any) {
        console.error("Answer question error:", error);
        return { success: false, message: "답변 등록 중 오류가 발생했습니다." };
    }
}

// 질문 삭제 (선생님용)
export async function deleteQuestion(questionId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, message: "로그인이 필요합니다." };
        }

        const role = user.user_metadata?.role;
        if (role !== 'teacher') {
            return { success: false, message: "선생님만 삭제할 수 있습니다." };
        }

        const adminClient = getAdminClient();

        const { error } = await adminClient
            .from('qna_posts')
            .delete()
            .eq('id', questionId);

        if (error) {
            console.error("Delete question error:", error);
            return { success: false, message: error.message };
        }

        revalidatePath('/admin/qna');

        return { success: true, message: "질문이 삭제되었습니다." };
    } catch (error: any) {
        console.error("Delete question error:", error);
        return { success: false, message: "삭제 중 오류가 발생했습니다." };
    }
}

// 질문 목록 조회 (관리자용)
export async function getQuestions() {
    try {
        const adminClient = getAdminClient();

        const { data, error } = await adminClient
            .from('qna_posts')
            .select(`
                *,
                student:users!qna_posts_student_id_fkey(id, name, email)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Get questions error:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Get questions error:", error);
        return [];
    }
}
