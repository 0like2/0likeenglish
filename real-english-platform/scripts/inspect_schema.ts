
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log("--- Checking 'exams' table ---");
    const { data: exams, error: examError } = await supabase.from('exams').select('id').limit(1);
    if (examError) {
        console.error("❌ 'exams' table ERROR:", examError.message);
    } else {
        console.log("✅ 'exams' table exists");
    }

    console.log("--- Checking 'lesson_plans' columns ---");
    const { data: lessons, error: lessonError } = await supabase.from('lesson_plans').select('exam_id').limit(1);
    if (lessonError) {
        console.error("❌ 'lesson_plans.exam_id' ERROR:", lessonError.message);
    } else {
        console.log("✅ 'lesson_plans.exam_id' column exists");
    }
}

inspectSchema();
