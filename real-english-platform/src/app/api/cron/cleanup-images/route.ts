import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * 30일 지난 이미지 자동 삭제 Cron Job
 *
 * Vercel Cron 설정 (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-images",
 *     "schedule": "0 3 * * *"  // 매일 오전 3시 (UTC)
 *   }]
 * }
 */

const RETENTION_DAYS = 30; // 이미지 보관 기간 (일)
const BUCKET_NAME = 'images';
const BATCH_SIZE = 100; // 한 번에 처리할 파일 수

export async function GET(request: Request) {
    // Cron 인증 확인 (Vercel Cron은 CRON_SECRET 헤더를 보냄)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // 로컬 개발 환경이거나 Cron 인증 통과
    const isLocal = process.env.NODE_ENV === 'development';
    const isAuthorized = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isLocal && !isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return NextResponse.json({ error: 'Missing service role key' }, { status: 500 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
    );

    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
        const cutoffTimestamp = cutoffDate.getTime();

        console.log(`[Cleanup] 기준일: ${cutoffDate.toISOString()} (${RETENTION_DAYS}일 전)`);

        // homework 폴더의 파일 목록 조회
        const { data: files, error: listError } = await supabase.storage
            .from(BUCKET_NAME)
            .list('homework', {
                limit: 1000,
                sortBy: { column: 'created_at', order: 'asc' }
            });

        if (listError) {
            console.error('[Cleanup] 파일 목록 조회 실패:', listError);
            return NextResponse.json({ error: listError.message }, { status: 500 });
        }

        if (!files || files.length === 0) {
            return NextResponse.json({
                success: true,
                message: '삭제할 파일이 없습니다',
                deleted: 0
            });
        }

        // 폴더(questId)별로 파일 수집
        const filesToDelete: string[] = [];

        for (const folder of files) {
            // .emptyFolderPlaceholder 제외
            if (folder.name.startsWith('.')) continue;

            // 각 폴더 내 파일 조회
            const { data: subFiles, error: subError } = await supabase.storage
                .from(BUCKET_NAME)
                .list(`homework/${folder.name}`, {
                    limit: 500,
                    sortBy: { column: 'created_at', order: 'asc' }
                });

            if (subError || !subFiles) continue;

            for (const file of subFiles) {
                if (file.name.startsWith('.')) continue;

                // 파일명에서 타임스탬프 추출 (예: 1703123456789.jpg)
                const timestampMatch = file.name.match(/^(\d+)\./);
                if (timestampMatch) {
                    const fileTimestamp = parseInt(timestampMatch[1], 10);
                    if (fileTimestamp < cutoffTimestamp) {
                        filesToDelete.push(`homework/${folder.name}/${file.name}`);
                    }
                }
            }
        }

        console.log(`[Cleanup] 삭제 대상 파일: ${filesToDelete.length}개`);

        if (filesToDelete.length === 0) {
            return NextResponse.json({
                success: true,
                message: '삭제할 파일이 없습니다',
                deleted: 0
            });
        }

        // 배치로 삭제
        let deletedCount = 0;
        for (let i = 0; i < filesToDelete.length; i += BATCH_SIZE) {
            const batch = filesToDelete.slice(i, i + BATCH_SIZE);
            const { error: deleteError } = await supabase.storage
                .from(BUCKET_NAME)
                .remove(batch);

            if (deleteError) {
                console.error(`[Cleanup] 삭제 실패 (배치 ${i / BATCH_SIZE + 1}):`, deleteError);
            } else {
                deletedCount += batch.length;
                console.log(`[Cleanup] 삭제 완료: ${batch.length}개 (누적: ${deletedCount}개)`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `${deletedCount}개 파일 삭제 완료`,
            deleted: deletedCount,
            cutoffDate: cutoffDate.toISOString()
        });

    } catch (error: any) {
        console.error('[Cleanup] 오류:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
