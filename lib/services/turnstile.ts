interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes': string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(
  token: string,
  remoteip?: string,
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('Turnstile secret key is not configured');
    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(
        `Turnstile API error: ${response.status} ${response.statusText}`,
      );
      return false;
    }

    const data: TurnstileVerifyResponse = await response.json();

    if (!data.success) {
      console.error('Turnstile verification failed:', {
        errors: data['error-codes'],
        hostname: data.hostname,
      });

      data['error-codes'].forEach((code) => {
        switch (code) {
          case 'missing-input-secret':
            console.error('Missing input secret');
            break;
          case 'invalid-input-secret':
            console.error('Invalid input secret');
            break;
          case 'missing-input-response':
            console.error('Missing input response');
            break;
          case 'invalid-input-response':
            console.error('Invalid input response');
            break;
          case 'timeout-or-duplicate':
            console.error('Timeout or duplicate');
            break;
          default:
            console.error(`Unknown error: ${code}`);
        }
      });
    }

    return data.success;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Turnstile verification timeout');
      } else {
        console.error('Error verifying Turnstile token:', error.message);
      }
    }
    return false;
  }
}
