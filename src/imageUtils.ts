/**
 * Browser-compatible image utilities to replace Sharp functionality
 */

/**
 * 画像フォーマットをマジックバイトから検出
 */
export function detectImageFormat(buffer: Uint8Array): string | null {
    // PNG: 89 50 4e 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 &&
        buffer[2] === 0x4e && buffer[3] === 0x47) {
        return 'PNG';
    }

    // JPEG: ff d8 ff
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'JPEG';
    }

    // WebP: 52 49 46 46 ... 57 45 42 50
    if (buffer[0] === 0x52 && buffer[1] === 0x49 &&
        buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 &&
        buffer[10] === 0x42 && buffer[11] === 0x50) {
        return 'WEBP';
    }

    return null;
}

/**
 * 画像の基本メタデータを取得（ブラウザAPI使用）
 */
export async function getImageMetadata(buffer: Uint8Array): Promise<{
    width?: number;
    height?: number;
    format?: string;
}> {
    return new Promise((resolve, reject) => {
        const blob = new Blob([buffer.buffer]);
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
                format: detectImageFormat(buffer) || undefined
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}
