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

// 6자리 영숫자 코드 생성
function generateRandomCode(length: number = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동되는 문자 제외 (0,O,1,I)
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ============================================
// 링크 코드 관리 (학생용)
// ============================================

// 학생의 링크 코드 조회 (없으면 생성)
export async function getOrCreateLinkCode() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "로그인이 필요합니다.", code: null };
    }

    const adminClient = getAdminClient();

    // 현재 사용자 정보 조회
    const { data: userData } = await adminClient
        .from('users')
        .select('role, link_code')
        .eq('id', user.id)
        .single();

    // 학생만 링크 코드 사용 가능
    if (userData?.role !== 'student' && userData?.role !== null) {
        return { success: false, message: "학생만 링크 코드를 사용할 수 있습니다.", code: null };
    }

    // 이미 코드가 있으면 반환
    if (userData?.link_code) {
        return { success: true, code: userData.link_code };
    }

    // 새 코드 생성 (중복 방지 루프)
    let newCode = '';
    let attempts = 0;
    while (attempts < 10) {
        newCode = generateRandomCode(6);
        const { data: existing } = await adminClient
            .from('users')
            .select('id')
            .eq('link_code', newCode)
            .single();

        if (!existing) break;
        attempts++;
    }

    if (attempts >= 10) {
        return { success: false, message: "코드 생성에 실패했습니다. 다시 시도해주세요.", code: null };
    }

    // 코드 저장
    const { error } = await adminClient
        .from('users')
        .update({ link_code: newCode })
        .eq('id', user.id);

    if (error) {
        console.error("Link code generation error:", error);
        return { success: false, message: error.message, code: null };
    }

    return { success: true, code: newCode };
}

// ============================================
// 자녀 연결 (학부모용)
// ============================================

// 학부모가 자녀 연결
export async function linkParentToStudent(linkCode: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "로그인이 필요합니다." };
    }

    const adminClient = getAdminClient();

    // 학부모 역할 확인
    const { data: parentData } = await adminClient
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (parentData?.role !== 'parent') {
        return { success: false, message: "학부모 계정만 자녀를 연결할 수 있습니다." };
    }

    // 링크 코드로 학생 찾기
    const normalizedCode = linkCode.toUpperCase().trim();
    const { data: student } = await adminClient
        .from('users')
        .select('id, name, role')
        .eq('link_code', normalizedCode)
        .single();

    if (!student) {
        return { success: false, message: "유효하지 않은 코드입니다. 코드를 다시 확인해주세요." };
    }

    if (student.role !== 'student' && student.role !== null) {
        return { success: false, message: "학생 계정의 코드만 연결할 수 있습니다." };
    }

    // 이미 연결되어 있는지 확인
    const { data: existing } = await adminClient
        .from('parent_student_links')
        .select('id')
        .eq('parent_id', user.id)
        .eq('student_id', student.id)
        .single();

    if (existing) {
        return { success: false, message: "이미 연결된 자녀입니다." };
    }

    // 연결 생성
    const { error } = await adminClient
        .from('parent_student_links')
        .insert({
            parent_id: user.id,
            student_id: student.id
        });

    if (error) {
        console.error("Link parent to student error:", error);
        return { success: false, message: error.message };
    }

    revalidatePath('/parent');

    return { success: true, message: `${student.name} 학생과 연결되었습니다.` };
}

// 자녀 연결 해제
export async function unlinkChild(studentId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "로그인이 필요합니다." };
    }

    const adminClient = getAdminClient();

    const { error } = await adminClient
        .from('parent_student_links')
        .delete()
        .eq('parent_id', user.id)
        .eq('student_id', studentId);

    if (error) {
        console.error("Unlink child error:", error);
        return { success: false, message: error.message };
    }

    revalidatePath('/parent');

    return { success: true, message: "연결이 해제되었습니다." };
}

// ============================================
// 자녀 목록 조회 (학부모용)
// ============================================

export async function getLinkedChildren() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const adminClient = getAdminClient();

    const { data, error } = await adminClient
        .from('parent_student_links')
        .select(`
            id,
            student_id,
            created_at,
            student:users!student_id (
                id,
                name,
                email,
                class_members (
                    status,
                    classes (
                        id,
                        name
                    )
                )
            )
        `)
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Get linked children error:", error);
        return [];
    }

    return data || [];
}

// 특정 자녀 정보 조회 (권한 확인 포함)
export async function getChildInfo(childId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { authorized: false, child: null };
    }

    const adminClient = getAdminClient();

    // 연결된 자녀인지 확인
    const { data: link } = await adminClient
        .from('parent_student_links')
        .select('id')
        .eq('parent_id', user.id)
        .eq('student_id', childId)
        .single();

    if (!link) {
        return { authorized: false, child: null };
    }

    // 자녀 정보 조회
    const { data: child } = await adminClient
        .from('users')
        .select(`
            id,
            name,
            email,
            class_members (
                status,
                class_id,
                classes (
                    id,
                    name
                )
            )
        `)
        .eq('id', childId)
        .single();

    return { authorized: true, child };
}
