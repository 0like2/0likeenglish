import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Missing Supabase URL or Service Role Key' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const logs = [];

    try {
        logs.push('🌱 Seeding Students and Classes...');

        // 1. Upsert Classes
        const classes = [
            {
                name: '고1/2 내신 집중반 (목)',
                day_of_week: '목',
                start_time: '18:00',
                end_time: '22:00',
                price: 400000,
                is_active: true
            },
            {
                name: '고3 수능 대비 과외 (토)',
                day_of_week: '토',
                start_time: '13:00',
                end_time: '17:00',
                price: 600000,
                is_active: true
            }
        ];

        const classMap: Record<string, string> = {};

        for (const cls of classes) {
            const { data, error } = await supabase
                .from('classes')
                .upsert(cls, { onConflict: 'name' })
                .select()
                .single();

            if (error) {
                logs.push(`Error upserting class ${cls.name}: ${error.message}`);
            } else if (data) {
                classMap[cls.name] = data.id;
                logs.push(`✅ Class upserted: ${cls.name}`);
            }
        }

        // 2. Upsert Users
        const users = [
            { email: 'nohdomi@example.com', name: '노도미', role: 'student', password: 'password123' },
            { email: 'jeonyoungseo@example.com', name: '전영서', role: 'student', password: 'password123' },
            { email: 'despair100@example.com', name: '특집100일의절망', role: 'student', password: 'password123' },
            { email: 'iyeonglag@example.com', name: '이영락', role: 'student', password: 'password123' }
        ];

        const userMap: Record<string, string> = {};

        for (const u of users) {
            // Check existence
            const { data: existingUser } = await supabase.from('users').select('id').eq('email', u.email).single();
            let userId = existingUser?.id;

            if (!userId) {
                // Create Auth User
                const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                    email: u.email,
                    password: u.password,
                    email_confirm: true,
                    user_metadata: { name: u.name, role: u.role }
                });

                if (authError) {
                    logs.push(`Auth User creation info for ${u.email}: ${authError.message}`);
                    // Maybe user exists in Auth but not in public table? Try fetching by email from Auth? 
                    // Admin API doesn't easily list by email without getUserById usually, but let's assume if generic error, maybe we skip or use existing if known.
                } else {
                    userId = authUser.user?.id;
                }
            }

            if (userId) {
                // Upsert public profile
                const { error: profileError } = await supabase
                    .from('users')
                    .upsert({
                        id: userId,
                        email: u.email,
                        name: u.name,
                        role: u.role
                    });

                if (profileError) logs.push(`Error updating profile for ${u.name}: ${profileError.message}`);
                else {
                    userMap[u.name] = userId;
                    logs.push(`✅ User upserted: ${u.name}`);
                }
            }
        }

        // 3. Enrollments
        const enrollments = [
            { userName: '노도미', className: '고1/2 내신 집중반 (목)' },
            { userName: '전영서', className: '고3 수능 대비 과외 (토)' }
        ];

        for (const enr of enrollments) {
            const uid = userMap[enr.userName];
            const cid = classMap[enr.className];

            if (uid && cid) {
                const { error } = await supabase
                    .from('class_members')
                    .upsert({
                        user_id: uid,
                        class_id: cid,
                        status: 'active',
                        joined_at: new Date().toISOString()
                    }, { onConflict: 'user_id,class_id' });

                if (error) logs.push(`Error enrolling ${enr.userName}: ${error.message}`);
                else logs.push(`✅ Enrolled ${enr.userName} in ${enr.className}`);
            }
        }

        // 4. Payments
        for (const name of Object.keys(userMap)) {
            const uid = userMap[name];
            // Insert expired payment
            const { error } = await supabase
                .from('payments')
                .insert({
                    user_id: uid,
                    amount: 0,
                    status: 'expired',
                    payment_date: new Date('2025-11-18').toISOString(),
                    method: 'card'
                });

            if (error) logs.push(`Error adding payment for ${name}: ${error.message}`);
            else logs.push(`✅ Added expired payment for ${name}`);
        }

        return NextResponse.json({ success: true, logs });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message, logs }, { status: 500 });
    }
}
