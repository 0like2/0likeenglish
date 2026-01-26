const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAccounts() {
  console.log('🔧 계정 정리 시작...\n');

  // 1. test-parent (dfdfasd@naver.com) - student에서 parent로 변경하거나 삭제
  const { data: wrongAccount } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'dfdfasd@naver.com')
    .single();

  if (wrongAccount) {
    console.log('발견: test-parent (dfdfasd@naver.com)');
    console.log('현재 role:', wrongAccount.role);

    // 삭제하기로 결정 (필요하면 role 변경으로 바꿀 수 있음)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('email', 'dfdfasd@naver.com');

    if (error) {
      console.log('❌ 삭제 실패:', error.message);
    } else {
      console.log('✅ 삭제 완료: test-parent (dfdfasd@naver.com)');
    }
  }

  // 2. Unknown (test@naver.com) 삭제
  const { data: unknownAccount } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'test@naver.com')
    .single();

  if (unknownAccount) {
    console.log('\n발견: Unknown (test@naver.com)');

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('email', 'test@naver.com');

    if (error) {
      console.log('❌ 삭제 실패:', error.message);
    } else {
      console.log('✅ 삭제 완료: Unknown (test@naver.com)');
    }
  }

  // 3. Test Admin (test@admin.com) - 필요하면 유지
  console.log('\n📋 정리 완료!');

  // 최종 목록 확인
  const { data: students } = await supabase
    .from('users')
    .select('name, email, role')
    .eq('role', 'student');

  console.log('\n=== 정리 후 학생 목록 ===');
  students?.forEach(s => {
    const isTest = s.email?.includes('test') || s.email?.includes('example');
    console.log(`${isTest ? '🧪' : '  '} ${s.name} (${s.email})`);
  });
}

fixAccounts();
