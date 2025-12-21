
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log("--- Inspecting Class Exams ---");
    const { data: exams, error: examError } = await supabase.from('class_exams').select('*').limit(1);
    if (examError) console.error(examError);
    else console.log("Class Exams:", exams && exams.length > 0 ? Object.keys(exams[0]) : "Empty");

    console.log("--- Inspecting Class Quests ---");
    const { data: quests, error: questError } = await supabase.from('class_quests').select('*').limit(1);
    if (questError) console.error(questError);
    else console.log("Class Quests:", quests && quests.length > 0 ? Object.keys(quests[0]) : "Empty");

    console.log("--- Inspecting Quest Progress ---");
    const { data: prog, error: progError } = await supabase.from('student_quest_progress').select('*').limit(1);
    if (progError) console.error(progError);
    else console.log("Quest Progress:", prog && prog.length > 0 ? Object.keys(prog[0]) : "Empty");
}

inspectSchema();
