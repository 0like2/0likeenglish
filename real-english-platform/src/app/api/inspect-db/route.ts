import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Query columns for qna_posts
        const { data, error } = await supabase
            .from('qna_posts')
            .select('*')
            .limit(1);

        if (error) {
            // If table empty, might return empty array.
            // If table doesn't exist, will error.
            return NextResponse.json({ error: error.message });
        }

        // If empty, we can't see columns from data keys.
        // Try inserting a dummy or check generated types if available?
        // Better: Introspection query if allowed?
        // Service role can usually query information_schema if using raw sql, but client doesn't support raw sql easily without rpc.
        // Let's rely on error message or data keys if any exist.

        return NextResponse.json({
            table: 'qna_posts',
            data: data,
            keys: data && data.length > 0 ? Object.keys(data[0]) : "No data found, cannot infer columns"
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
