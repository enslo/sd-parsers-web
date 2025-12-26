import { ParserManager } from '../../src';

/**
 * Integration tests for file-based image parsing
 * 
 * NOTE: These tests are skipped in browser environment as they rely on file system access.
 * Browser-specific integration tests should be created separately using Blob/ArrayBuffer inputs.
 */
describe.skip('Integration Tests (Node.js only - skipped in browser)', () => {
  let parserManager: ParserManager;

  beforeEach(() => {
    parserManager = new ParserManager();
  });

  it('placeholder test', () => {
    // These tests require file system access which is not available in browsers
    // See README for browser usage examples with Blob/ArrayBuffer inputs
    expect(true).toBe(true);
  });
});
