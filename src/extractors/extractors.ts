import extractChunks from 'png-chunks-extract';
import { parse as parseExif } from 'exifr';
import { Generators } from '../data';
import { MetadataError } from '../exceptions';

/**
 * Type definition for metadata extractor functions (browser-compatible)
 */
export type ExtractorFunction = (
  buffer: Uint8Array,
  generator: Generators
) => Promise<Record<string, any> | null>;

/**
 * Extract metadata from PNG image info
 * 
 * Browser version note: This function currently returns null as browser APIs
 * do not provide DPI/density information like Sharp does in Node.js.
 * Kept for API compatibility with original library and future implementation.
 */
export async function pngImageInfo(buffer: Uint8Array, _: Generators): Promise<Record<string, any> | null> {
  try {
    // For PNG, we can extract basic info but skip advanced metadata
    // that would require sharp
    const result: Record<string, any> = {};

    // We could parse PNG IHDR chunk here if needed
    // For now, return empty as basic metadata isn't critical

    return Object.keys(result).length > 0 ? result : null;
  } catch (error) {
    throw new MetadataError(`Error reading PNG metadata: ${error}`);
  }
}

/**
 * Extract metadata from PNG text chunks
 */
export async function pngImageText(buffer: Uint8Array, _: Generators): Promise<Record<string, any> | null> {
  try {
    // Extract PNG chunks directly from buffer
    const chunks = extractChunks(buffer);

    // Look for text chunks
    const textChunks = chunks.filter(chunk =>
      chunk.name === 'tEXt' ||
      chunk.name === 'zTXt' ||
      chunk.name === 'iTXt'
    );

    if (textChunks.length === 0) {
      return null;
    }

    const result: Record<string, any> = {};

    for (const chunk of textChunks) {
      try {
        let text: string;
        let keyword: string;

        if (chunk.name === 'tEXt') {
          // Uncompressed text
          const data = chunk.data;
          const nullIndex = data.indexOf(0);
          if (nullIndex === -1) continue;

          keyword = new TextDecoder('latin1').decode(data.subarray(0, nullIndex));
          text = new TextDecoder('latin1').decode(data.subarray(nullIndex + 1));

        } else if (chunk.name === 'zTXt') {
          // Compressed text (would need zlib)
          continue;
        } else if (chunk.name === 'iTXt') {
          // International text (more complex format)
          continue;
        } else {
          continue;
        }

        // Store the text data
        if (keyword && text) {
          result[keyword] = text;

          // Common SD metadata keywords
          if (keyword.toLowerCase() === 'parameters') {
            result.parameters = text;
          }
        }
      } catch (error) {
        // Skip problematic chunks
        continue;
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch (error) {
    throw new MetadataError(`Error reading PNG text chunks: ${error}`);
  }
}

/**
 * Extract metadata from PNG stenographic alpha channel
 * 
 * Browser version note: Stenographic analysis is not implemented in the browser version.
 * This feature requires specialized image processing that is not available in browsers.
 * Kept for API compatibility with original library.
 */
export async function pngStenographicAlpha(buffer: Uint8Array, _: Generators): Promise<Record<string, any> | null> {
  try {
    // This would require specialized stenographic analysis
    // For now, return null as this is a complex feature
    return null;
  } catch (error) {
    throw new MetadataError(`Error reading stenographic alpha: ${error}`);
  }
}

/**
 * Extract metadata from JPEG UserComment EXIF field
 */
export async function jpegUserComment(buffer: Uint8Array, generator: Generators): Promise<Record<string, any> | null> {
  try {

    // Use exifr to parse EXIF data with various options
    const exif = await parseExif(buffer, {
      userComment: true,
      pick: ['userComment']
    });


    // Check for userComment in various forms
    const userComment = exif?.userComment || exif?.UserComment || exif?.['0x9286'];

    if (userComment) {

      // exifr returns raw bytes - need to decode based on character code
      if (userComment instanceof Uint8Array) {
        // UserComment structure: first 8 bytes = character code, rest = data
        const charCodeBytes = userComment.slice(0, 8);
        const charCode = new TextDecoder('ascii').decode(charCodeBytes).replace(/\0/g, '');


        // Skip the first 8 bytes
        const dataBuffer = userComment.slice(8);

        let decodedComment: string;
        if (charCode === 'UNICODE') {
          // UTF-16 big-endian (more common in EXIF)
          decodedComment = new TextDecoder('utf-16be').decode(dataBuffer);
        } else if (charCode === 'ASCII') {
          decodedComment = new TextDecoder('ascii').decode(dataBuffer);
        } else {
          // Default to UTF-8
          decodedComment = new TextDecoder('utf-8').decode(dataBuffer);
        }


        if (generator === Generators.AUTOMATIC1111 || generator === Generators.FOOOCUS) {
          return { parameters: decodedComment };
        }
        return { userComment: decodedComment };
      }

      // If it's a string, use it directly
      if (typeof userComment === 'string') {
        return { parameters: userComment };
      }

      return null;
    }

    return null;
  } catch (error) {
    if (generator === Generators.AUTOMATIC1111 || generator === Generators.FOOOCUS) {
      return null;
    }
    throw new MetadataError(`Error reading JPEG UserComment: ${error}`);
  }
}
