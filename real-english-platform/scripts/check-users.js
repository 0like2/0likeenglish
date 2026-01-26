const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllUsers() {
  const { data: users } = await supabase
    .from('users')
    .select('id, name, email, role')
    .order('created_at', { ascending: false });

  console.log('=== 전체 사용자 목록 ===\n');

  // Group by role
  const students = users?.filter(u => u.role === 'student') || [];
  const teachers = users?.filter(u => u.role === 'teacher') || [];
  const parents = users?.filter(u => u.role === 'parent') || [];
  const others = users?.filter(u => !['student', 'teacher', 'parent'].includes(u.role)) || [];

  console.log(`[student] (${students.length}명)`);
  students.forEach(u => {
    const isTest = u.email?.includes('test') || u.email?.includes('example');
    const marker = isTest ? ' [TEST]' : '';
    console.log(`  ${u.name} (${u.email})${marker}`);
  });

  console.log(`\n[teacher] (${teachers.length}명)`);
  teachers.forEach(u => {
    console.log(`  ${u.name} (${u.email})`);
  });

  console.log(`\n[parent] (${parents.length}명)`);
  parents.forEach(u => {
    const isTest = u.email?.includes('test');
    const marker = isTest ? ' [TEST]' : '';
    console.log(`  ${u.name} (${u.email})${marker}`);
  });

  if (others.length > 0) {
    console.log(`\n[기타/null] (${others.length}명)`);
    others.forEach(u => {
      console.log(`  ${u.name} (${u.email}) role=${u.role}`);
    });
  }
}

checkAllUsers();
