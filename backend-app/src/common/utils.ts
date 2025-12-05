import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';

export function generateToken(len = 32) {
  return randomBytes(len).toString('hex');
}

export async function hashToken(token: string) {
  return await bcrypt.hash(token, 12);
}

export async function compareToken(hash: string, token: string) {
  return await bcrypt.compare(token, hash);
}
