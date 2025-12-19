
import { createClient } from '@/lib/supabase/client';

export interface BlogPost {
    id: number;
    title: string;
    content: string;
    category: string;
    created_at: string;
    is_published: boolean;
}

export async function getBlogPosts() {
    const supabase = createClient();

    // Select all published posts
    // Note: We might want to add pagination later, but for now fetch all
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching blog posts:", error);
        return [];
    }

    return data as BlogPost[];
}
