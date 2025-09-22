export function getShareUrlByShortCode(shortCode: string) {
  return `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${shortCode}`;
}
