import type { Metadata } from 'next';

import { REDRESSED_SUPPORT_THRESHOLD } from '@/constants/discourse';
import { buildAbsoluteUrl } from '@/lib/utils/url';

const DESCRIPTION_LIMIT = 160;
const DEFAULT_IMAGE = '/images/default-project.png';
const DEFAULT_THREAD_DESCRIPTION = 'Join the discussion on Pensieve.';
const DEFAULT_ANSWER_DESCRIPTION =
  'See how the community is responding on Pensieve.';

const TOPIC_LABELS: Record<string, string> = {
  general: 'General Issue',
  financial: 'Financial Loss / Token Issues',
  scam: 'Scam & Fraud Concerns',
  governance: 'Governance & DAO',
  technical: 'Technical Failures / Security',
  support: 'Customer Support & Comms',
  marketing: 'Marketing & Transparency',
  ux: 'User Experience & Usability',
  regulatory: 'Regulatory & Compliance',
  community: 'Community & Reputation',
  ethics: 'Ethical & Value Concerns',
  misc: 'Misc',
};

export const resolveTopicLabel = (raw?: string | null): string => {
  const normalized = raw?.trim();
  if (!normalized) return 'Thread';
  const key = normalized.toLowerCase();
  const byValue = TOPIC_LABELS[key];
  if (byValue) return byValue;
  const matchedByLabel = Object.values(TOPIC_LABELS).find(
    (label) => label.toLowerCase() === key,
  );
  return matchedByLabel ?? normalized;
};

export type DiscourseProjectMeta = {
  name?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
};

export type DiscourseThreadMeta = {
  id: number;
  title: string;
  post?: string | null;
  support?: number | null;
  isScam?: boolean | null;
  tag?: string | null;
};

export type DiscourseAnswerMeta = {
  id: number;
  content?: string | null;
};

const formatPlainText = (value?: string | null): string => {
  if (!value) {
    return '';
  }
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const truncateText = (value: string, limit = DESCRIPTION_LIMIT): string => {
  if (!value) {
    return '';
  }
  if (value.length <= limit) {
    return value;
  }
  return `${value.slice(0, Math.max(0, limit - 3))}...`;
};

const buildDescription = (
  source: string | null | undefined,
  fallback: string,
): string => {
  const normalized = truncateText(formatPlainText(source));
  return normalized || fallback;
};

const resolveImageUrl = (
  imagePath: string | null | undefined,
  origin: string,
) => buildAbsoluteUrl(imagePath?.trim() || DEFAULT_IMAGE, origin);

const buildBaseMetadata = ({
  title,
  description,
  origin,
  path,
  imagePath,
  seeAlso,
}: {
  title: string;
  description: string;
  origin: string;
  path: string;
  imagePath?: string | null;
  seeAlso?: string;
}): Metadata => {
  const url = buildAbsoluteUrl(path, origin);
  const imageUrl = resolveImageUrl(imagePath, origin);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Pensieve',
      images: [{ url: imageUrl, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
    other: seeAlso
      ? {
          'og:see_also': seeAlso,
        }
      : undefined,
  };
};

const formatSupportProgress = (
  support?: number | null,
  target = REDRESSED_SUPPORT_THRESHOLD,
): string => {
  const formatter = new Intl.NumberFormat('en-US');
  const current = Math.max(0, Math.round(support ?? 0));
  return `${formatter.format(current)} / ${formatter.format(target)}`;
};

export const buildThreadMeta = ({
  thread,
  project,
  origin,
  path,
}: {
  thread: DiscourseThreadMeta;
  project?: DiscourseProjectMeta | null;
  origin: string;
  path: string;
}): Metadata => {
  const projectName = project?.name?.trim() || 'Pensieve';
  const threadTag = resolveTopicLabel(thread.tag);
  const title = `[Pensieve Discourse]-[${threadTag}]-${thread.title}-${projectName}`;
  const description = buildDescription(
    thread.post ?? project?.tagline,
    DEFAULT_THREAD_DESCRIPTION,
  );

  return buildBaseMetadata({
    title,
    description,
    origin,
    path,
    imagePath: project?.logoUrl,
  });
};

export const buildScamAlertMeta = ({
  thread,
  project,
  origin,
  path,
}: {
  thread: DiscourseThreadMeta;
  project?: DiscourseProjectMeta | null;
  origin: string;
  path: string;
}): Metadata => {
  const projectName = project?.name?.trim() || 'Project';
  const threadTag = resolveTopicLabel(thread.tag);
  const progressText = formatSupportProgress(
    thread.support,
    REDRESSED_SUPPORT_THRESHOLD,
  );
  const title = `Pensieve Discourse-${threadTag}-${thread.title}-${projectName}`;
  const baseDetail = buildDescription(
    thread.post ?? project?.tagline,
    DEFAULT_THREAD_DESCRIPTION,
  );
  const description = truncateText(
    `Alert Displayed | Support ${progressText}. ${baseDetail}`,
  );

  return buildBaseMetadata({
    title,
    description,
    origin,
    path,
    imagePath: project?.logoUrl,
  });
};

export const buildAnswerMeta = ({
  answer,
  thread,
  project,
  origin,
  path,
  parentPath,
}: {
  answer: DiscourseAnswerMeta;
  thread: DiscourseThreadMeta;
  project?: DiscourseProjectMeta | null;
  origin: string;
  path: string;
  parentPath: string;
}): Metadata => {
  const title = `Answer · ${thread.title}`;
  const description = buildDescription(
    answer.content ?? project?.tagline,
    DEFAULT_ANSWER_DESCRIPTION,
  );

  return buildBaseMetadata({
    title,
    description,
    origin,
    path,
    imagePath: project?.logoUrl,
    seeAlso: buildAbsoluteUrl(parentPath, origin),
  });
};
