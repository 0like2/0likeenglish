import { createClient } from "@/lib/supabase/client";

export async function uploadImage(file: File): Promise<string> {
    const supabase = createClient();

    // Generate a unique filename: timestamp-random-filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

    if (uploadError) {
        throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

    return publicUrl;
}
