
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envConfig.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values) {
        let val = values.join('=').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        env[key.trim()] = val;
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function promoteToTeacher(email: string) {
    console.log(`Promoting ${email} to teacher...`);

    // 1. Get User ID
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const user = users.find(u => u.email === email);
    if (!user) {
        console.error('User not found');
        return;
    }

    console.log(`Found user ${user.id}`);

    // 2. Update Auth Metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, role: 'teacher' }
    });
    if (updateError) throw updateError;
    console.log('Updated Auth Metadata');

    // 3. Update Public Table
    const { error: dbError } = await supabase
        .from('users')
        .update({ role: 'teacher' })
        .eq('id', user.id);

    if (dbError) throw dbError;
    console.log('Updated Database Role');

    console.log('Success!');
}

promoteToTeacher('nohdomi@example.com');
