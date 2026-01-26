/**
 * 답지 CSV 파일을 읽어서 Supabase에 등록하는 스크립트
 *
 * 사용법:
 * npx tsx scripts/seed-answers.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('환경 변수가 설정되지 않았습니다.');
    console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인하세요.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CSV 파일 경로
const EASY_CSV_PATH = path.join(__dirname, '../../답지 pdf/쉬운문제 답지.csv');
const LISTENING_CSV_PATH = path.join(__dirname, '../../답지 pdf/자이스토리 답지.csv');

async function seedEasyAnswers() {
    console.log('\n📚 쉬운문제 답지 등록 시작...');

    // 1. 교재 생성
    const bookName = '2026 수능특강 쉬운문제';
    let bookId: string;

    const { data: existingBook } = await supabase
        .from('easy_books')
        .select('id')
        .eq('name', bookName)
        .single();

    if (existingBook) {
        bookId = existingBook.id;
        console.log(`  ✓ 기존 교재 사용: ${bookName}`);
    } else {
        const { data: newBook, error } = await supabase
            .from('easy_books')
            .insert({ name: bookName, description: '수능특강 쉬운문제 풀이' })
            .select()
            .single();

        if (error) {
            console.error('  ✗ 교재 생성 실패:', error.message);
            return;
        }
        bookId = newBook.id;
        console.log(`  ✓ 새 교재 생성: ${bookName}`);
    }

    // 2. CSV 파일 읽기
    const csvContent = fs.readFileSync(EASY_CSV_PATH, 'utf-8');
    const lines = csvContent.trim().split('\n').slice(1); // 헤더 제외

    let successCount = 0;
    let skipCount = 0;

    for (const line of lines) {
        // 형식: 1회,18,3,19,1,20,1,25,3,26,4,27,5,28,4,43,2,44,5,45,2
        const parts = line.split(',');
        const roundMatch = parts[0].match(/(\d+)회/);
        if (!roundMatch) continue;

        const roundNumber = parseInt(roundMatch[1]);

        // 정답 추출 (번호,정답 쌍에서 정답만)
        // 순서: 18,19,20,25,26,27,28,43,44,45
        const answers: number[] = [];
        for (let i = 1; i < parts.length; i += 2) {
            const answer = parseInt(parts[i + 1]);
            if (!isNaN(answer)) {
                answers.push(answer);
            }
        }

        if (answers.length !== 10) {
            console.log(`  ⚠ ${roundNumber}회: 정답 개수 불일치 (${answers.length}개)`);
            continue;
        }

        // 기존 회차 확인
        const { data: existing } = await supabase
            .from('easy_rounds')
            .select('id')
            .eq('book_id', bookId)
            .eq('round_number', roundNumber)
            .single();

        if (existing) {
            skipCount++;
            continue;
        }

        // 회차 등록
        const { error } = await supabase.from('easy_rounds').insert({
            book_id: bookId,
            round_number: roundNumber,
            title: `${roundNumber}회`,
            answers: answers,
            question_count: 10
        });

        if (error) {
            console.log(`  ✗ ${roundNumber}회 등록 실패:`, error.message);
        } else {
            successCount++;
        }
    }

    console.log(`  ✓ 쉬운문제 등록 완료: ${successCount}개 추가, ${skipCount}개 스킵`);
}

async function seedListeningAnswers() {
    console.log('\n🎧 듣기 답지 등록 시작...');

    // 1. 교재 생성
    const bookName = '2026 자이스토리 영어듣기';
    let bookId: string;

    const { data: existingBook } = await supabase
        .from('listening_books')
        .select('id')
        .eq('name', bookName)
        .single();

    if (existingBook) {
        bookId = existingBook.id;
        console.log(`  ✓ 기존 교재 사용: ${bookName}`);
    } else {
        const { data: newBook, error } = await supabase
            .from('listening_books')
            .insert({ name: bookName, description: '자이스토리 영어 듣기 실전 모의고사' })
            .select()
            .single();

        if (error) {
            console.error('  ✗ 교재 생성 실패:', error.message);
            return;
        }
        bookId = newBook.id;
        console.log(`  ✓ 새 교재 생성: ${bookName}`);
    }

    // 2. CSV 파일 읽기
    const csvContent = fs.readFileSync(LISTENING_CSV_PATH, 'utf-8');
    const lines = csvContent.trim().split('\n').slice(1); // 헤더 제외

    let successCount = 0;
    let skipCount = 0;

    for (const line of lines) {
        // 형식: 1회,5,5,1,4,2,3,2,5,4,3,3,2,1,3,1,5,3
        const parts = line.split(',');
        const roundMatch = parts[0].match(/(\d+)회/);
        if (!roundMatch) continue;

        const roundNumber = parseInt(roundMatch[1]);

        // 정답 추출 (1-17번)
        const answers: number[] = [];
        for (let i = 1; i <= 17 && i < parts.length; i++) {
            const answer = parseInt(parts[i]);
            if (!isNaN(answer) && answer >= 1 && answer <= 5) {
                answers.push(answer);
            }
        }

        if (answers.length !== 17) {
            console.log(`  ⚠ ${roundNumber}회: 정답 개수 불일치 (${answers.length}개)`);
            continue;
        }

        // 기존 회차 확인
        const { data: existing } = await supabase
            .from('listening_rounds')
            .select('id')
            .eq('book_id', bookId)
            .eq('round_number', roundNumber)
            .single();

        if (existing) {
            skipCount++;
            continue;
        }

        // 회차 등록
        const { error } = await supabase.from('listening_rounds').insert({
            book_id: bookId,
            round_number: roundNumber,
            title: `${roundNumber}회`,
            answers: answers,
            question_count: 17
        });

        if (error) {
            console.log(`  ✗ ${roundNumber}회 등록 실패:`, error.message);
        } else {
            successCount++;
        }
    }

    console.log(`  ✓ 듣기 등록 완료: ${successCount}개 추가, ${skipCount}개 스킵`);
}

async function main() {
    console.log('🚀 답지 등록 스크립트 시작');
    console.log('='.repeat(50));

    try {
        await seedListeningAnswers();
        await seedEasyAnswers();
        console.log('\n✅ 모든 답지 등록 완료!');
    } catch (error) {
        console.error('\n❌ 오류 발생:', error);
    }
}

main();
