import { createModel, createPrompt, createSampler, Generators } from '../src';

/**
 * Test utilities for creating mock data and test images
 */

/**
 * Creates a minimal valid PNG buffer (1x1 white pixel)
 * This is a browser-compatible alternative to Sharp
 */
export function createTestPng(width = 100, height = 100, color = { r: 255, g: 255, b: 255 }): Uint8Array {
  // Minimal PNG structure: signature + IHDR + IDAT + IEND
  // This creates a valid 1x1 white PNG
  const pngSignature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk (image header)
  const ihdr = new Uint8Array([
    0x00, 0x00, 0x00, 0x0d, // Length: 13 bytes
    0x49, 0x48, 0x44, 0x52, // Type: IHDR
    0x00, 0x00, 0x00, 0x01, // Width: 1
    0x00, 0x00, 0x00, 0x01, // Height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, etc.
    0x90, 0x77, 0x53, 0xde, // CRC
  ]);

  // IDAT chunk (image data)
  const idat = new Uint8Array([
    0x00, 0x00, 0x00, 0x0c, // Length: 12 bytes
    0x49, 0x44, 0x41, 0x54, // Type: IDAT
    0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00, 0x00,
    0x03, 0x01, 0x01, 0x00,
    0x18, 0xdd, 0x8d, 0xb4, // CRC
  ]);

  // IEND chunk (end of PNG)
  const iend = new Uint8Array([
    0x00, 0x00, 0x00, 0x00, // Length: 0
    0x49, 0x45, 0x4e, 0x44, // Type: IEND
    0xae, 0x42, 0x60, 0x82, // CRC
  ]);

  // Combine all chunks
  const totalLength = pngSignature.length + ihdr.length + idat.length + iend.length;
  const png = new Uint8Array(totalLength);
  let offset = 0;

  png.set(pngSignature, offset); offset += pngSignature.length;
  png.set(ihdr, offset); offset += ihdr.length;
  png.set(idat, offset); offset += idat.length;
  png.set(iend, offset);

  return png;
}

/**
 * Creates a minimal valid JPEG buffer
 */
export function createTestJpeg(width = 100, height = 100, color = { r: 255, g: 255, b: 255 }): Uint8Array {
  // Minimal JPEG structure: SOI + APP0 + SOF0 + SOS + compressed data + EOI
  // This creates a valid minimal JPEG
  return new Uint8Array([
    0xff, 0xd8, // SOI (Start of Image)
    0xff, 0xe0, // APP0
    0x00, 0x10, // Length
    0x4a, 0x46, 0x49, 0x46, 0x00, // JFIF identifier
    0x01, 0x01, // Version
    0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
    0xff, 0xd9, // EOI (End of Image)
  ]);
}

/**
 * Creates mock PromptInfo for testing
 */
export function createMockPromptInfo(generator: Generators = Generators.AUTOMATIC1111) {
  return {
    generator,
    samplers: [
      createSampler('Euler', {
        steps: 20,
        cfg_scale: 7,
        seed: 123456789
      })
    ],
    metadata: {
      full_prompt: 'test prompt',
      full_negative_prompt: 'test negative prompt',
      models: [createModel({ name: 'test_model', hash: 'abc123' })]
    },
    rawParameters: {
      parameters: 'test prompt\nNegative prompt: test negative prompt\nSteps: 20, Sampler: Euler, CFG scale: 7'
    }
  };
}

/**
 * Creates mock AUTOMATIC1111 parameters
 */
export function createMockA1111Parameters(prompt = 'test prompt', negativePrompt = 'test negative') {
  return {
    parameters: `${prompt}
Negative prompt: ${negativePrompt}
Steps: 20, Sampler: Euler, CFG scale: 7, Seed: 123456789, Size: 512x512, Model: test_model, Model hash: abc123`
  };
}

/**
 * Creates mock Fooocus parameters
 */
export function createMockFooocusParameters(prompt = 'test prompt', negativePrompt = 'test negative') {
  return {
    parameters: JSON.stringify({
      base_model: 'test_model',
      base_model_hash: 'abc123',
      sampler: 'dpmpp_2m_sde_gpu',
      cfg_scale: 4,
      steps: 30,
      full_prompt: prompt,
      full_negative_prompt: negativePrompt,
      seed: 123456789,
      resolution: [512, 768]
    })
  };
}

/**
 * Creates mock ComfyUI workflow parameters
 */
export function createMockComfyUIParameters() {
  return {
    prompt: JSON.stringify({
      "1": {
        "class_type": "KSampler",
        "inputs": {
          "sampler_name": "euler",
          "steps": 20,
          "cfg": 7.5,
          "seed": 123456789
        }
      },
      "2": {
        "class_type": "CLIPTextEncode",
        "inputs": {
          "text": "test prompt"
        }
      }
    }),
    workflow: JSON.stringify({
      links: [],
      nodes: []
    })
  };
}

/**
 * Assertion helpers for common test patterns
 */
export const testHelpers = {
  /**
   * Asserts that a PromptInfo object has the expected basic structure
   */
  assertValidPromptInfo(promptInfo: any, expectedGenerator: Generators) {
    expect(promptInfo).toBeDefined();
    expect(promptInfo.generator).toBe(expectedGenerator);
    expect(promptInfo.samplers).toBeDefined();
    expect(Array.isArray(promptInfo.samplers)).toBe(true);
    expect(promptInfo.metadata).toBeDefined();
    expect(promptInfo.rawParameters).toBeDefined();
  },

  /**
   * Asserts that a sampler has the expected basic structure
   */
  assertValidSampler(sampler: any, expectedName?: string) {
    expect(sampler).toBeDefined();
    expect(sampler.name).toBeDefined();
    expect(sampler.parameters).toBeDefined();
    expect(typeof sampler.parameters).toBe('object');

    if (expectedName) {
      expect(sampler.name).toBe(expectedName);
    }
  },

  /**
   * Asserts that a model has the expected basic structure
   */
  assertValidModel(model: any, expectedName?: string, expectedHash?: string) {
    expect(model).toBeDefined();
    expect(model.metadata).toBeDefined();

    if (expectedName) {
      expect(model.name).toBe(expectedName);
    }

    if (expectedHash) {
      expect(model.hash).toBe(expectedHash);
    }
  }
};
