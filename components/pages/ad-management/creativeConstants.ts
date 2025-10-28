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
  previewWidthClass: 'w-[200px]',
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
