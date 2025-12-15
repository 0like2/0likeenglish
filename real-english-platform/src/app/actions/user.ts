'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get('name') as string;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "로그인이 필요합니다." };
    }

    if (!name || name.trim().length < 2) {
        return { success: false, message: "이름은 2글자 이상이어야 합니다." };
    }

    // Update public.users table
    const { error } = await supabase
        .from('users')
        .update({ name: name.trim() })
        .eq('id', user.id);

    if (error) {
        console.error("Update profile error:", error);
        return { success: false, message: "프로필 수정 중 오류가 발생했습니다." };
    }

    // Also update Supabase Auth User Metadata (optional but good for sync)
    await supabase.auth.updateUser({
        data: { name: name.trim() }
    });

    revalidatePath('/dashboard');
    revalidatePath('/settings'); // We will make this page

    return { success: true, message: "프로필이 수정되었습니다." };
}
