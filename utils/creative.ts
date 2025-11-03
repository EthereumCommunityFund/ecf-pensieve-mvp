const IPFS_PREFIX = 'ipfs://';
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
export const DATA_URI_PREFIX = 'data:application/json';

export interface CreativeMetadataPayload {
  contentType?: string;
  title?: string;
  linkUrl?: string;
  mediaUrl?: string;
  assets?: {
    desktop?: string;
    mobile?: string;
    fallback?: string;
  };
}

export interface CreativeAssets {
  primaryImageUrl: string | null;
  desktopImageUrl: string | null;
  mobileImageUrl: string | null;
  fallbackImageUrl: string | null;
  targetUrl: string | null;
}

export const normalizeCreativeUrl = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith(IPFS_PREFIX)) {
    const ipfsPath = trimmed.slice(IPFS_PREFIX.length);
    return `${IPFS_GATEWAY}${ipfsPath}`;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return url.toString();
    }
  } catch (error) {
    return null;
  }

  return null;
};

export const parseCreativeMetadata = (
  uri?: string | null,
): CreativeMetadataPayload | null => {
  if (!uri || !uri.startsWith(DATA_URI_PREFIX)) {
    return null;
  }

  try {
    const [, payload = ''] = uri.split(',', 2);
    if (!payload) {
      return null;
    }
    const decoded = decodeURIComponent(payload);
    return JSON.parse(decoded) as CreativeMetadataPayload;
  } catch (error) {
    console.error('Failed to parse creative metadata payload:', error);
    return null;
  }
};

export const extractCreativeAssets = (uri?: string | null): CreativeAssets => {
  if (!uri) {
    return {
      primaryImageUrl: null,
      desktopImageUrl: null,
      mobileImageUrl: null,
      fallbackImageUrl: null,
      targetUrl: null,
    };
  }

  const normalizedDirect = normalizeCreativeUrl(uri);

  if (!uri.startsWith(DATA_URI_PREFIX)) {
    return {
      primaryImageUrl: normalizedDirect,
      desktopImageUrl: normalizedDirect,
      mobileImageUrl: normalizedDirect,
      fallbackImageUrl: normalizedDirect,
      targetUrl: normalizedDirect,
    };
  }

  const metadata = parseCreativeMetadata(uri);

  const desktop = normalizeCreativeUrl(
    metadata?.assets?.desktop ?? metadata?.mediaUrl ?? null,
  );
  const mobile = normalizeCreativeUrl(metadata?.assets?.mobile ?? null);
  const fallback = normalizeCreativeUrl(metadata?.assets?.fallback ?? null);
  const link = normalizeCreativeUrl(metadata?.linkUrl ?? null);

  const primaryImageUrl =
    desktop ?? mobile ?? fallback ?? link ?? normalizedDirect ?? null;

  return {
    primaryImageUrl,
    desktopImageUrl: desktop ?? null,
    mobileImageUrl: mobile ?? null,
    fallbackImageUrl: fallback ?? null,
    targetUrl: link ?? normalizedDirect ?? null,
  };
};
