
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listPublicUsers() {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) {
        console.error("Error fetching users:", error);
        return;
    }
    console.log(`✅ Total Users Found: ${users.length}`);
    console.log('--- User List ---');
    users.forEach((u: any) => {
        console.log(`[${u.role}] ${u.name} (${u.email})`);
    });
}

listPublicUsers();
