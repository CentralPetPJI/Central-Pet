import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':');

  if (!salt || !hash) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(hash, 'hex');

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKey, derivedKey);
}

/**
 * Generate a cryptographically secure random password.
 * Uses base64 encoding and normalizes URL-unsafe chars to letters, then trims to length.
 */
export function generateRandomPassword(length = 12) {
  const bytes = Math.ceil((length * 3) / 4);
  const raw = randomBytes(bytes).toString('base64');
  // replace URL-unsafe base64 chars to keep the password simple, then trim
  return raw.replace(/\+/g, 'A').replace(/\//g, 'B').replace(/=/g, 'C').slice(0, length);
}
