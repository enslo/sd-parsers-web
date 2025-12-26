import { PromptInfo, Generators } from './data';
import { MetadataError, ParserError } from './exceptions';
import { METADATA_EXTRACTORS, Eagerness, ExtractorFunction } from './extractors';
import { Parser, MANAGED_PARSERS } from './parsers';
import { detectImageFormat } from './imageUtils';

/**
 * Input types that can be parsed (browser-compatible)
 */
export type ParseInput = Blob | ArrayBuffer | Uint8Array;

/**
 * Provides a simple way of testing multiple parser modules against a given image
 */
export class ParserManager {
  private eagerness: Eagerness;
  private debug: boolean;
  private managedParsers: Parser[];

  constructor(options: {
    debug?: boolean;
    eagerness?: Eagerness;
    managedParsers?: (new (normalizeParameters?: boolean, debug?: boolean) => Parser)[];
    normalizeParameters?: boolean;
  } = {}) {
    const {
      debug = false,
      eagerness = Eagerness.DEFAULT,
      managedParsers,
      normalizeParameters = true
    } = options;

    this.eagerness = eagerness;
    this.debug = debug;

    const parsersToUse = managedParsers || MANAGED_PARSERS;
    this.managedParsers = parsersToUse.map(ParserClass =>
      new ParserClass(normalizeParameters, debug)
    );
  }

  /**
   * Try to extract image generation parameters from the given image.
   */
  async parse(
    input: ParseInput,
    eagerness?: Eagerness
  ): Promise<PromptInfo | null> {
    const targetEagerness = eagerness || this.eagerness;

    // Convert input to Uint8Array
    let buffer: Uint8Array;

    if (input instanceof Blob) {
      const arrayBuffer = await input.arrayBuffer();
      buffer = new Uint8Array(arrayBuffer);
    } else if (input instanceof ArrayBuffer) {
      buffer = new Uint8Array(input);
    } else {
      buffer = input;
    }

    // Detect image format from magic bytes
    const format = detectImageFormat(buffer);

    if (!format) {
      if (this.debug) {
        console.log('Unknown image format');
      }
      return null;
    }

    // Get extractors for this format
    const extractors = METADATA_EXTRACTORS[format];
    if (!extractors) {
      if (this.debug) {
        console.log(`Unsupported image format: ${format}`);
      }
      return null;
    }

    // Try extractors in order of eagerness
    for (const eagernessLevel of [Eagerness.FAST, Eagerness.DEFAULT, Eagerness.EAGER]) {
      if (eagernessLevel > targetEagerness) {
        break;
      }

      const levelExtractors = extractors[eagernessLevel];
      if (!levelExtractors) {
        continue;
      }

      for (const extractor of levelExtractors) {
        for (const parser of this.managedParsers) {
          try {
            const parameters = await extractor(buffer, parser.generator);

            if (!parameters) {
              continue;
            }

            try {
              return await parser.parse(parameters);
            } catch (error) {
              if (error instanceof ParserError) {
                if (this.debug) {
                  console.error(`Error in parser[${parser.constructor.name}]: ${error.message}`);
                }
              } else {
                throw error;
              }
            }
          } catch (error) {
            if (error instanceof MetadataError) {
              if (this.debug) {
                console.error('Error reading metadata:', error.message);
              }
              break; // Break from parser loop, try next extractor
            } else {
              throw error;
            }
          }
        }
      }
    }

    return null;
  }
}
