'use strict';

const { randomBytes } = require('crypto');

const ALPHABET = '123456789AQWXSCZEDCVFRTGBHYNMJUIKLOP0aqwxszedcvfrtgbnhyujmkiolp';

const generateRandomString = (length = 20) => {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
};

const generateCode = (prefix, length = 20) => `${prefix}_${generateRandomString(length)}`;

module.exports = { generateRandomString, generateCode };
