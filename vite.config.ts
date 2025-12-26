import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'SDParsersWeb',
            formats: ['es', 'umd'],
            fileName: (format: string) => `sd-parsers-web.${format}.js`
        },
        rollupOptions: {
            // 外部依存として指定（バンドルに含めない）
            external: ['exifr', 'png-chunks-extract'],
            output: {
                globals: {
                    'exifr': 'exifr',
                    'png-chunks-extract': 'pngChunksExtract'
                }
            }
        },
        // Disable sourcemaps in production for smaller bundle size
        sourcemap: false
    },
    plugins: [
        dts({
            insertTypesEntry: true,
            rollupTypes: true
        })
    ]
});
