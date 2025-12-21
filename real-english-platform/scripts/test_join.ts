
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log("--- Testing Class + Members Join Query ---");
    // Try to fetch ONE class with member count
    const { data: classData, error } = await supabase
        .from('classes')
        .select('*, class_members(count)')
        .limit(1)
        .single(); // Intentionally may fail if empty, but we check error

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'JSON object requested, multiple (or no) rows returned' - fine for limit(1)
        console.error("❌ Class Query Failed:", error);
    } else if (classData) {
        console.log("✅ Class Query Succeeded.");
        console.log("Member Count Access Check:", classData.class_members?.[0]?.count);
    } else {
        console.log("⚠️ No classes found to test.");
    }

    console.log("--- Testing Exams Query ---");
    const { data: exams, error: examError } = await supabase
        .from('exams')
        .select('id, title, category')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

    if (examError) {
        console.error("❌ Exam Query Failed:", examError);
    } else {
        console.log("✅ Exam Query Succeeded:", exams?.length);
    }
}

inspectSchema();
