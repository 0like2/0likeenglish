import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function updateProfile(prevState: any, formData: FormData) {
    const supabaseUser = await createClient();
    const name = formData.get('name') as string;

    const { data: { user } } = await supabaseUser.auth.getUser();

    if (!user) {
        return { success: false, message: "로그인이 필요합니다." };
    }

    if (!name || name.trim().length < 2) {
        return { success: false, message: "이름은 2글자 이상이어야 합니다." };
    }

    // Use Admin Client to bypass RLS for public.users upsert
    // This ensures that even if the user row doesn't exist or RLS is strict, we can save the profile.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let dbClient = supabaseUser;

    if (serviceRoleKey) {
        dbClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        ) as any;
    }

    // Upsert public.users table to ensure row exists
    const updates = {
        id: user.id,
        email: user.email,
        name: name.trim(),
        role: 'student', // Default role if creating new
        // Add other fields if necessary, assuming defaults handle the rest
    };

    // Use upsert to creating if missing
    const { error } = await dbClient
        .from('users')
        .upsert(updates, { onConflict: 'id' });

    if (error) {
        console.error("Update profile error:", error);
        return { success: false, message: `프로필 수정 실패: ${error.message}` };
    }

    // Also update Supabase Auth User Metadata (optional but good for sync)
    await supabaseUser.auth.updateUser({
        data: { name: name.trim() }
    });

    revalidatePath('/dashboard');
    revalidatePath('/settings');
    revalidatePath('/', 'layout'); // Update global layout (navbar user name)

    return { success: true, message: "프로필이 수정되었습니다." };
}
