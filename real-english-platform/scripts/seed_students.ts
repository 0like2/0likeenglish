import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedStudents() {
    console.log('🌱 Seeding Students and Classes...');

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

    const classMap: Record<string, string> = {}; // Name -> ID

    for (const cls of classes) {
        const { data, error } = await supabase
            .from('classes')
            .upsert(cls, { onConflict: 'name' }) // Assuming name uniqueness for simplified seeding
            .select()
            .single();

        if (error) {
            console.error(`Error upserting class ${cls.name}:`, error.message);
        } else if (data) {
            classMap[cls.name] = data.id;
            console.log(`✅ Class upserted: ${cls.name}`);
        }
    }

    // 2. Upsert Users
    const users = [
        {
            email: 'nohdomi@example.com',
            name: '노도미',
            role: 'student',
            password: 'password123' // Only for Auth, but here we insert to public.users directly mostly.
            // Note: Inserting to public.users doesn't create Auth User clearly. 
            // Correct way for "Real" users is to use supabase.auth.admin.createUser but for simple display we might just need public.users if auth is decoupled?
            // Actually, the app relies on auth.users for login. I should try to create auth users.
        },
        {
            email: 'jeonyoungseo@example.com',
            name: '전영서',
            role: 'student',
            password: 'password123'
        },
        {
            email: 'despair100@example.com',
            name: '특집100일의절망',
            role: 'student',
            password: 'password123'
        },
        {
            email: 'iyeonglag@example.com',
            name: '이영락',
            role: 'student',
            password: 'password123'
        }
    ];

    const userMap: Record<string, string> = {}; // Name -> ID

    for (const u of users) {
        // Create Auth User
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { name: u.name, role: u.role }
        });

        let userId = authUser.user?.id;

        if (authError) {
            // If already exists, try to find public user
            console.warn(`Auth User ${u.email} might already exist: ${authError.message}`);
            // Fetch public user ID
            const { data: publicUser } = await supabase.from('users').select('id').eq('email', u.email).single();
            if (publicUser) userId = publicUser.id;
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

            if (profileError) console.error(`Error updating profile for ${u.name}:`, profileError.message);
            else {
                userMap[u.name] = userId;
                console.log(`✅ User upserted: ${u.name}`);
            }
        }
    }

    // 3. Upsert Enrollments (Class Members)
    // Map: Noh Do-mi -> High 1/2, Jeon Young-seo -> High 3
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
                }, { onConflict: 'user_id,class_id' }); // adjust constraint name if needed or assume conflict handled

            if (error) console.error(`Error enrolling ${enr.userName}:`, error.message);
            else console.log(`✅ Enrolled ${enr.userName} in ${enr.className}`);
        }
    }

    // 4. Upsert Payments (Status: Expired for all as per screenshot)
    // Assuming 'payments' table links to user. Logic in 'admin.ts' checks `payments?.[0]?.status`.
    for (const name of Object.keys(userMap)) {
        const uid = userMap[name];
        // Insert a dummy expired payment
        const { error } = await supabase
            .from('payments')
            .insert({
                user_id: uid,
                amount: 0,
                status: 'expired',
                payment_date: new Date('2025-11-18').toISOString(), // Old date
                method: 'card'
            }); // Just insert, multiple payments allowed usually.

        if (error) console.error(`Error adding payment for ${name}:`, error.message);
        else console.log(`✅ Added expired payment for ${name}`);
    }

    console.log('🎉 Seeding Complete!');
}

seedStudents().catch(console.error);
