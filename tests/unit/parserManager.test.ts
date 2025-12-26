import { ParserManager, Eagerness, Generators } from '../../src';

describe('ParserManager', () => {
  describe('Constructor', () => {
    it('should create ParserManager instance with default options', () => {
      const parserManager = new ParserManager();
      expect(parserManager).toBeInstanceOf(ParserManager);
    });

    it('should create ParserManager with custom options', () => {
      const customManager = new ParserManager({
        debug: true,
        eagerness: Eagerness.EAGER,
        normalizeParameters: false
      });

      expect(customManager).toBeInstanceOf(ParserManager);
    });

    it('should accept custom managed parsers', () => {
      const customManager = new ParserManager({
        managedParsers: []
      });

      expect(customManager).toBeInstanceOf(ParserManager);
    });
  });

  describe('Input validation', () => {
    let parserManager: ParserManager;

    beforeEach(() => {
      parserManager = new ParserManager();
    });

    it('should handle invalid image data gracefully', async () => {
      const result = await parserManager.parse(new Uint8Array([1, 2, 3, 4]));
      expect(result).toBeNull();
    });

    it('should handle empty buffer', async () => {
      const result = await parserManager.parse(new Uint8Array(0));
      expect(result).toBeNull();
    });

    it('should accept Uint8Array input', async () => {
      const buffer = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG signature
      const result = await parserManager.parse(buffer);
      // Result will be null as this is not a complete PNG, but it should not throw
      expect(result).toBeNull();
    });

    it('should accept ArrayBuffer input', async () => {
      const arrayBuffer = new ArrayBuffer(4);
      const result = await parserManager.parse(arrayBuffer);
      expect(result).toBeNull();
    });

    it('should accept Blob input', async () => {
      const blob = new Blob([new Uint8Array([1, 2, 3, 4])]);
      const result = await parserManager.parse(blob);
      expect(result).toBeNull();
    });
  });

  describe('Eagerness levels', () => {
    it('should respect FAST eagerness setting', () => {
      const manager = new ParserManager({ eagerness: Eagerness.FAST });
      expect(manager).toBeInstanceOf(ParserManager);
    });

    it('should respect DEFAULT eagerness setting', () => {
      const manager = new ParserManager({ eagerness: Eagerness.DEFAULT });
      expect(manager).toBeInstanceOf(ParserManager);
    });

    it('should respect EAGER eagerness setting', () => {
      const manager = new ParserManager({ eagerness: Eagerness.EAGER });
      expect(manager).toBeInstanceOf(ParserManager);
    });
  });
});
