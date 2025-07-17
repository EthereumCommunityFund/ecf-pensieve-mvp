import { nanoid } from 'nanoid';

export function generateShortCode(): string {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  return nanoid(6).replace(
    /[01lIO]/g,
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  );
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
