import { randomBytes } from 'crypto';

// Unambiguous-ish alphabet (mirrors the project convention).
const ALPHABET = '123456789AQWXSCZEDCVFRTGBHYNMJUIKLOP0aqwxszedcvfrtgbnhyujmkiolp';

export const generateRandomString = (length = 20): string => {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
};

/** Public, human-readable identifier: `<prefix>_<random>` (e.g. `usr_...`). */
export const generateCode = (prefix: string, length = 20): string =>
  `${prefix}_${generateRandomString(length)}`;

/**
 * Resolve a public route param to a Sequelize `where` clause. Numeric values
 * match the internal `id`; everything else (e.g. `prp_...`) matches `code`.
 */
export const identifierWhere = (value: string | number): Record<string, unknown> =>
  /^\d+$/.test(String(value)) ? { id: Number(value) } : { code: String(value) };

const utils = { generateRandomString, generateCode, identifierWhere };

export default utils;
