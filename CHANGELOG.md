# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-27

### 🎉 Major Release: Browser-Only Library

This release marks a complete rewrite of `sd-parsers` as a **browser-only** library (`sd-parsers-web`). The library has been migrated from Node.js to run exclusively in web browsers.

### ⚠️ Breaking Changes

- **Node.js support removed**: This library now runs only in browsers
- **CLI removed**: The `npx sd-parsers` command line interface is no longer available
- **Sharp dependency removed**: Replaced with browser-native APIs (Canvas, Image, Blob)
- **File path inputs removed**: Only accepts `Blob`, `ArrayBuffer`, or `Uint8Array` inputs
- **Module format**: Built with Vite, outputs ESM and UMD formats

### ✨ Added

- **Browser-first architecture**: Uses browser-native APIs for image processing
- **Vite build system**: Modern, fast bundling with optimized output
- **Import Maps support**: Example HTML with CDN dependencies
- **Enhanced EXIF metadata extraction**: 
  - Proper UTF-16BE decoding for JPEG UserComment fields
  - Support for UNICODE, ASCII, and UTF-8 character encodings
  - Fixed case sensitivity issues with exifr library
- **Browser-compatible test suite**: Jest with jsdom environment
- **Lightweight bundle**: ~6.3 KB gzipped (ESM), ~5.5 KB gzipped (UMD)
- **Source maps disabled**: Smaller production bundle

### 🔧 Changed

- **Build tool**: TypeScript compiler → Vite
- **Test environment**: Node.js → jsdom (browser simulation)
- **Image processing**: Sharp → Browser APIs (Image, Blob, URL.createObjectURL)
- **Dependencies**: Only `exifr` and `png-chunks-extract` (both browser-compatible)

### 🐛 Fixed

- JPEG UserComment character encoding (now correctly decodes UTF-16BE)
- PNG metadata extraction in browser environments
- Type definitions for browser-specific inputs

### 📦 Package Changes

- **Package name**: `sd-parsers` → `sd-parsers-web`
- **Main exports**: UMD and ESM formats
- **Type definitions**: Full TypeScript support maintained

### 🧪 Testing

- 73 unit tests passing
- 1 integration test suite skipped (Node.js file system dependent)
- Browser environment verified with real SD-generated images

### 📚 Documentation

- README updated for browser-only usage
- Example HTML file for browser demonstration
- Browser limitations documented

### 🎯 Supported Generators

All original generators remain supported:
- AUTOMATIC1111 webui ✅
- Fooocus ✅
- ComfyUI ✅
- InvokeAI ✅
- NovelAI ✅

---

## [0.x.x] - Previous Releases

*Previous versions were Node.js-based. See git history for details.*

---

**Migration Guide**: If you need Node.js support, please use the original `sd-parsers` package or pin to the last Node.js-compatible version. This library is designed exclusively for browser environments.
