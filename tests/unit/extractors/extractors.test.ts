import {
  pngImageInfo,
  pngImageText,
  pngStenographicAlpha,
  jpegUserComment
} from '../../../src/extractors/extractors';
import { Generators } from '../../../src/data';
import { createTestPng, createTestJpeg } from '../../test-utils';

describe('Extractors', () => {
  describe('pngImageInfo', () => {
    it('should return null for basic PNG (browser version limitation)', async () => {
      const testPng = createTestPng();
      const result = await pngImageInfo(testPng, Generators.AUTOMATIC1111);

      // Browser version currently returns null as it doesn't parse IHDR
      expect(result).toBeNull();
    });

    it('should handle different image sizes', async () => {
      const testPng = createTestPng(50, 50);
      const result = await pngImageInfo(testPng, Generators.AUTOMATIC1111);

      // Should still return null (not implemented in browser version)
      expect(result).toBeNull();
    });
  });

  describe('pngImageText', () => {
    it('should handle invalid PNG CRC (mock PNG limitation)', async () => {
      // Our mock PNG has invalid CRC, which png-chunks-extract will reject
      const testPng = createTestPng();

      // png-chunks-extract throws on invalid CRC
      await expect(pngImageText(testPng, Generators.AUTOMATIC1111)).rejects.toThrow();
    });

    it('should handle PNG processing errors gracefully', async () => {
      const invalidBuffer = new Uint8Array([1, 2, 3, 4]);

      await expect(pngImageText(invalidBuffer, Generators.AUTOMATIC1111)).rejects.toThrow();
    });
  });

  describe('pngStenographicAlpha', () => {
    it('should return null for stenographic analysis (not implemented)', async () => {
      const testPng = createTestPng();
      const result = await pngStenographicAlpha(testPng, Generators.AUTOMATIC1111);

      // This feature is not implemented in browser version
      expect(result).toBeNull();
    });
  });

  describe('jpegUserComment', () => {
    it('should return null for JPEG without EXIF', async () => {
      const testJpeg = createTestJpeg();
      const result = await jpegUserComment(testJpeg, Generators.AUTOMATIC1111);

      // Should return null since we don't have EXIF data
      expect(result).toBeNull();
    });

    it('should handle different generators', async () => {
      const testJpeg = createTestJpeg();

      const result1 = await jpegUserComment(testJpeg, Generators.AUTOMATIC1111);
      const result2 = await jpegUserComment(testJpeg, Generators.FOOOCUS);
      const result3 = await jpegUserComment(testJpeg, Generators.COMFYUI);

      // All should return null for JPEG without EXIF
      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });

    it('should handle invalid JPEG data', async () => {
      const invalidBuffer = new Uint8Array([0xff, 0xd8, 0x00, 0x00]); // Invalid JPEG

      // exifr should handle this gracefully
      const result = await jpegUserComment(invalidBuffer, Generators.AUTOMATIC1111);
      expect(result).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should handle invalid image data in extractors', async () => {
      const invalidBuffer = new Uint8Array([1, 2, 3, 4, 5]);

      // pngImageInfo returns null for invalid data
      const result1 = await pngImageInfo(invalidBuffer, Generators.AUTOMATIC1111);
      expect(result1).toBeNull();

      // pngImageText should throw for invalid PNG
      await expect(pngImageText(invalidBuffer, Generators.AUTOMATIC1111)).rejects.toThrow();

      // jpegUserComment returns null for AUTOMATIC1111 (even for invalid data)
      const result3 = await jpegUserComment(invalidBuffer, Generators.AUTOMATIC1111);
      expect(result3).toBeNull();
    });
  });
});
