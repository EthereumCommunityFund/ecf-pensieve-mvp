export const DESKTOP_CREATIVE_CONFIG = {
  aspectRatio: 4,
  maxWidth: 900,
  maxHeight: 225,
  previewWidthClass: 'w-full',
  previewAspectClass: 'aspect-[4/1]',
  ratioLabel: '4:1',
  labelSuffix: '900 × 225',
  helperText: 'Recommended dimensions 900 × 225',
};

export const MOBILE_CREATIVE_CONFIG = {
  aspectRatio: 4,
  maxWidth: 900,
  maxHeight: 225,
  previewWidthClass: 'w-[400px]',
  previewAspectClass: 'aspect-[4/1]',
  ratioLabel: '4:1',
  labelSuffix: '4:1',
  helperText: 'Recommended ratio 4:1',
};

export const CREATIVE_GUIDANCE = {
  desktopDescription:
    'Upload a desktop creative sized for wide placements. We will enforce the required crop automatically.',
  mobileDescription:
    'Upload a mobile creative sized for widescreen placements. The asset will be cropped automatically.',
  combinedDescription: (ratioLabel: string, recommendedLabel: string) =>
    `Upload two ${ratioLabel} creatives (recommended ${recommendedLabel}) for desktop and mobile placements. We will apply the required crop automatically. Click the card to replace the file.`,
  viewDescription:
    'Review the current desktop and mobile creatives associated with this slot.',
};

export type CreativeUploadConfig = {
  width: number;
  height: number;
  aspectRatio: number;
  ratioLabel: string;
  label: string;
  helperText: string;
};

export type CreativeUploadConfigs = {
  desktop: CreativeUploadConfig;
  mobile: CreativeUploadConfig;
};

const DEFAULT_DESKTOP_UPLOAD_CONFIG: CreativeUploadConfig = {
  width: DESKTOP_CREATIVE_CONFIG.maxWidth,
  height: DESKTOP_CREATIVE_CONFIG.maxHeight,
  aspectRatio: DESKTOP_CREATIVE_CONFIG.aspectRatio,
  ratioLabel: DESKTOP_CREATIVE_CONFIG.ratioLabel,
  label: DESKTOP_CREATIVE_CONFIG.labelSuffix,
  helperText: DESKTOP_CREATIVE_CONFIG.helperText,
};

const DEFAULT_MOBILE_UPLOAD_CONFIG: CreativeUploadConfig = {
  width: MOBILE_CREATIVE_CONFIG.maxWidth,
  height: MOBILE_CREATIVE_CONFIG.maxHeight,
  aspectRatio: MOBILE_CREATIVE_CONFIG.aspectRatio,
  ratioLabel:
    MOBILE_CREATIVE_CONFIG.ratioLabel ?? DESKTOP_CREATIVE_CONFIG.ratioLabel,
  label:
    MOBILE_CREATIVE_CONFIG.labelSuffix ??
    `${MOBILE_CREATIVE_CONFIG.maxWidth} × ${MOBILE_CREATIVE_CONFIG.maxHeight}`,
  helperText: MOBILE_CREATIVE_CONFIG.helperText,
};

export const DEFAULT_CREATIVE_UPLOAD_CONFIG: CreativeUploadConfigs = {
  desktop: DEFAULT_DESKTOP_UPLOAD_CONFIG,
  mobile: DEFAULT_MOBILE_UPLOAD_CONFIG,
};

const formatRatioLabel = (width: number, height: number) => {
  const gcd = (a: number, b: number): number =>
    b === 0 ? Math.abs(a) : gcd(b, a % b);
  const divisor = gcd(width, height) || 1;
  const w = Math.round(width / divisor);
  const h = Math.round(height / divisor);
  return `${w}:${h}`;
};

const buildUploadConfig = (
  source: Partial<CreativeUploadConfig> | undefined | null,
  fallback: CreativeUploadConfig,
): CreativeUploadConfig => {
  if (!source) {
    return fallback;
  }

  const width =
    typeof source.width === 'number' && Number.isFinite(source.width)
      ? Math.max(1, Math.round(source.width))
      : fallback.width;
  const height =
    typeof source.height === 'number' && Number.isFinite(source.height)
      ? Math.max(1, Math.round(source.height))
      : fallback.height;

  const aspectRatio =
    typeof source.aspectRatio === 'number' && source.aspectRatio > 0
      ? source.aspectRatio
      : width / height;

  const label =
    typeof source.label === 'string' && source.label.trim().length > 0
      ? source.label
      : `${width} × ${height}`;

  const helperText =
    typeof source.helperText === 'string' && source.helperText.trim().length > 0
      ? source.helperText
      : `Recommended dimensions ${width} × ${height}`;

  const ratioLabel =
    typeof source.ratioLabel === 'string' && source.ratioLabel.trim().length > 0
      ? source.ratioLabel
      : formatRatioLabel(width, height);

  return {
    width,
    height,
    aspectRatio,
    label,
    helperText,
    ratioLabel,
  };
};

export const resolveCreativeUploadConfigs = (
  slotConfig?: {
    desktop?: Partial<CreativeUploadConfig> | null;
    mobile?: Partial<CreativeUploadConfig> | null;
  } | null,
): CreativeUploadConfigs => {
  const desktopSource = slotConfig?.desktop ?? null;
  const mobileSource = slotConfig?.mobile ?? null;
  const desktopConfig = buildUploadConfig(
    desktopSource,
    DEFAULT_DESKTOP_UPLOAD_CONFIG,
  );
  const mobileFallback = desktopSource
    ? desktopConfig
    : DEFAULT_MOBILE_UPLOAD_CONFIG;

  return {
    desktop: desktopConfig,
    mobile: buildUploadConfig(mobileSource, mobileFallback),
  };
};
