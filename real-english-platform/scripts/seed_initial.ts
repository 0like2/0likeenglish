
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

async function seed() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Missing Supabase URL or Service Role Key");
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Get or Create a User (Teacher)
    // We need a user_id to attach posts to.
    let userId = '';
    const { data: users, error: userError } = await supabase.from('users').select('id').limit(1);

    if (users && users.length > 0) {
        userId = users[0].id;
        console.log(`Using existing user: ${userId}`);
    } else {
        console.log("No users found. Creating a placeholder user in auth...");
        // Creating auth user via API is complex without admin API enabled fully. 
        // We will try to fetch from auth.users via admin client if possible, or fail gracefully.
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        if (authUsers.users.length > 0) {
            userId = authUsers.users[0].id;
            console.log(`Found auth user: ${userId}`);
            // Ensure public.users record exists
            await supabase.from('users').upsert({ id: userId, email: authUsers.users[0].email, name: 'Admin Teacher', role: 'teacher' });
        } else {
            console.error("No Auth Users found. Please sign up at least once before seeding.");
            return;
        }
    }

    // 2. Define Blog Posts
    const samplePosts = [
        {
            title: "[문법] 관계대명사와 관계부사의 완벽 정리",
            category: "grammar",
            content: `
# 관계대명사 vs 관계부사

영어 문법에서 가장 헷갈리는 부분 중 하나인 관계사와 관계부사를 정리해봅니다.

## 1. 관계대명사 (Relative Pronoun)
- **종류**: who, which, that
- **역할**: 접속사 + 대명사
- **특징**: 뒤에 불완전한 문장이 옴 (주어나 목적어가 없음)

예문:
> This is the house **which** I bought. (동사 bought의 목적어가 없음)

## 2. 관계부사 (Relative Adverb)
- **종류**: where, when, why, how
- **역할**: 접속사 + 부사
- **특징**: 뒤에 완전한 문장이 옴

예문:
> This is the house **where** I live. (live는 자동사로 문장이 완전함)

## 핵심 구분법
뒤에 오는 문장이 **완전하면 관계부사**, **불완전하면 관계대명사**를 씁니다.
            `,
            is_published: true,
            teacher_id: userId,
            created_at: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
        },
        {
            title: "[어휘] 수능 1등급을 위한 필수 유의어/반의어 모음",
            category: "voca",
            content: `
# 수능 필수 유의어 정리

## 1. '중요한' (Important)
- significant
- crucial
- vital
- essential
- critical

## 2. '줄이다' (Decrease)
- diminish
- reduce
- lessen
- curtail
- shrink

## 3. '발생하다' (Happen)
- occur
- take place
- arise
- come about

이 단어들은 지문에서 패러프레이징(Paraphrasing)될 때 자주 사용되니 꼭 암기하세요!
            `,
            is_published: true,
            teacher_id: userId,
            created_at: new Date(Date.now() - 86400000 * 3).toISOString() // 3 days ago
        },
        {
            title: "[듣기] 쉐도잉 연습을 위한 추천 미드 5선",
            category: "listening",
            content: `
# 쉐도잉하기 좋은 미드 추천

1. **Friends (프렌즈)**
   - 일상 대화가 많고 발음이 비교적 정확함. 초보자 추천.

2. **Modern Family (모던 패밀리)**
   - 다양한 연령대의 영어를 접할 수 있음. 실생활 표현 가득.

3. **Emily in Paris (에밀리 파리에 가다)**
   - 비즈니스 영어와 일상 영어가 적절히 섞여 있음.

## 쉐도잉 팁
- 한 문장을 10번 이상 반복해서 입에 붙을 때까지 연습하세요.
- 자막 없이 들릴 때까지 반복하는 것이 중요합니다.
            `,
            is_published: true,
            teacher_id: userId,
            created_at: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
        },
        {
            title: "[시험자료] 2024 고3 3월 모의고사 영어 분석 자료",
            category: "exam",
            content: `
# 3월 모의고사 총평

이번 3월 모의고사는 빈칸 추론이 다소 까다로웠습니다.

## 주요 킬러 문항
- **31번 (빈칸)**: 문맥상의 동의어를 찾는 능력이 요구됨.
- **34번 (빈칸)**: 철학적 지문으로 해석이 난해했음.
- **39번 (문장 삽입)**: 흐름의 단절을 찾는 것이 핵심.

## 향후 학습 방향
EBS 연계교재(수능특강) 단어 암기를 철저히 하고, 구문 독해 연습 비중을 늘려야 합니다.
            `,
            is_published: true,
            teacher_id: userId,
            created_at: new Date(Date.now() - 86400000 * 1).toISOString()
        },
        {
            title: "[공지] 2월 설날 연휴 휴강 안내",
            category: "notice",
            content: `
안녕하세요, Real English입니다.

다가오는 민족 대명절 설날을 맞아 학원 휴강 일정을 안내드립니다.

- **휴강 기간**: 2월 9일(금) ~ 2월 12일(월)
- **정상 수업**: 2월 13일(화)부터

즐거운 명절 보내시고, 재충전해서 만나요!
            `,
            is_published: true,
            teacher_id: userId,
            created_at: new Date().toISOString()
        }
    ];

    // Check duplicates? Or just insert? User asked to "pre-register", usually means "fill it up".
    // We will use upsert based on title to avoid dupes if they run it twice.
    // Upsert requires a constraint. Title is not unique. 
    // We'll filter first.

    for (const post of samplePosts) {
        const { data: existing } = await supabase.from('blog_posts').select('id').eq('title', post.title).single();
        if (!existing) {
            console.log(`Inserting: ${post.title}`);
            const { error } = await supabase.from('blog_posts').insert(post);
            if (error) console.error(`Error inserting ${post.title}:`, error);
        } else {
            console.log(`Skipping existing: ${post.title}`);
        }
    }

    console.log("Seeding completed!");
}

seed();
