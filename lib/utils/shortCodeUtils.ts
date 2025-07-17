import { customAlphabet } from 'nanoid';

export function generateShortCode(): string {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, 6);
  return nanoid();
}

export async function generateUniqueShortCode(
  checkExists: (code: string) => Promise<boolean>,
  maxRetries: number = 5,
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const code = generateShortCode();
    const exists = await checkExists(code);
    if (!exists) {
      return code;
    }
  }
  throw new Error('Failed to generate unique short code after maximum retries');
}
