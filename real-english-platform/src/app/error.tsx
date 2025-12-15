'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">오류가 발생했습니다</h2>
            <p className="text-slate-500 mb-6">죄송합니다. 요청을 처리하는 중에 문제가 발생했습니다.</p>
            <div className="flex gap-4">
                <Button onClick={() => reset()}>다시 시도</Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>홈으로 이동</Button>
            </div>
        </div>
    );
}
