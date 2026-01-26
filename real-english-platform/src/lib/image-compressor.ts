/**
 * 클라이언트 사이드 이미지 압축 유틸리티
 * Canvas API를 사용하여 이미지 크기와 품질을 줄임
 */

export interface CompressOptions {
    maxWidth?: number;      // 최대 너비 (기본: 800px)
    maxHeight?: number;     // 최대 높이 (기본: 800px)
    quality?: number;       // JPEG 품질 0-1 (기본: 0.7)
    maxSizeMB?: number;     // 최대 파일 크기 MB (기본: 0.2)
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.7,
    maxSizeMB: 0.2  // 200KB
};

/**
 * 이미지 파일을 압축합니다
 * @param file 원본 이미지 파일
 * @param options 압축 옵션
 * @returns 압축된 File 객체
 */
export async function compressImage(
    file: File,
    options: CompressOptions = {}
): Promise<File> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // 이미지가 아니면 그대로 반환
    if (!file.type.startsWith('image/')) {
        return file;
    }

    // 이미 충분히 작으면 그대로 반환
    if (file.size <= opts.maxSizeMB * 1024 * 1024) {
        console.log(`이미지가 이미 충분히 작음: ${(file.size / 1024).toFixed(1)}KB`);
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;

                    // 비율 유지하면서 크기 조정
                    if (width > opts.maxWidth || height > opts.maxHeight) {
                        const ratio = Math.min(
                            opts.maxWidth / width,
                            opts.maxHeight / height
                        );
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Canvas context를 가져올 수 없습니다'));
                        return;
                    }

                    // 흰색 배경 (투명 PNG → JPEG 변환 시)
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);

                    // 이미지 그리기
                    ctx.drawImage(img, 0, 0, width, height);

                    // JPEG로 변환 (압축률이 좋음)
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('이미지 변환 실패'));
                                return;
                            }

                            // 새 파일 생성
                            const compressedFile = new File(
                                [blob],
                                file.name.replace(/\.[^.]+$/, '.jpg'),
                                { type: 'image/jpeg' }
                            );

                            const originalSize = (file.size / 1024).toFixed(1);
                            const compressedSize = (compressedFile.size / 1024).toFixed(1);
                            const ratio = ((1 - compressedFile.size / file.size) * 100).toFixed(0);

                            console.log(
                                `이미지 압축 완료: ${originalSize}KB → ${compressedSize}KB (${ratio}% 감소)`
                            );

                            resolve(compressedFile);
                        },
                        'image/jpeg',
                        opts.quality
                    );
                } catch (err) {
                    reject(err);
                }
            };

            img.onerror = () => reject(new Error('이미지 로드 실패'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('파일 읽기 실패'));
        reader.readAsDataURL(file);
    });
}

/**
 * 파일 크기를 읽기 쉬운 형태로 변환
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}
