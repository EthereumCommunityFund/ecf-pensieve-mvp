const SABLIER_DOMAINS = [
  'sablier.com',
  'sablier.finance',
  'sablier.me',

  'app.sablier.com',
  'app.sablier.finance',
  'docs.sablier.com',
  'blog.sablier.com',
  'files.sablier.com',
  'evm-token-list.sablier.com',
  'evm-token-list.sablier.io',
];

export function isSablierDomain(input: string): boolean {
  try {
    if (!input) return false;

    const urlString = input.startsWith('http') ? input : `https://${input}`;
    const parsedUrl = new URL(urlString);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (SABLIER_DOMAINS.includes(hostname)) {
      return true;
    }

    if (
      hostname.endsWith('.sablier.com') ||
      hostname.endsWith('.sablier.finance') ||
      hostname.endsWith('.sablier.me')
    ) {
      return true;
    }

    if (
      hostname === 'github.com' &&
      parsedUrl.pathname.startsWith('/sablier-labs')
    ) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}
