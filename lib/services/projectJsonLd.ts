import type { ProjectStructuredData } from '@/lib/services/projectService';
import { buildAbsoluteUrl } from '@/lib/utils/url';

const ADDITIONAL_PROPERTY_IGNORED_KEYS = new Set([
  'name',
  'tagline',
  'mainDescription',
  'logoUrl',
  'tags',
  'categories',
  'websites',
  'social_links',
  'founders',
]);

function formatKeyForDisplay(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(.)/, (match) => match.toUpperCase());
}

function toDisplayString(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.toString().trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function booleanToText(value: boolean | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return value ? 'Yes' : 'No';
}

function normalizeUrlForJsonLd(value?: string | null): string | undefined {
  const trimmed = toDisplayString(value);
  if (!trimmed) {
    return undefined;
  }

  if (/^(https?:|mailto:|ipfs:)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return buildAbsoluteUrl(trimmed);
  }

  return undefined;
}

function resolveImageUrl(value?: string | null): string {
  const normalized = normalizeUrlForJsonLd(value);
  if (normalized) {
    return normalized;
  }
  return buildAbsoluteUrl('/images/default-project.png');
}

function buildSmartContractsSummary(
  entries: ProjectStructuredData['dappSmartContracts'],
): string | undefined {
  if (!entries || entries.length === 0) {
    return undefined;
  }

  const summaries = entries
    .map((entry) => {
      const chain = toDisplayString(entry.chain);
      const address = toDisplayString(entry.addresses ?? entry.id);
      if (chain && address) {
        return `${chain}: ${address}`;
      }
      return address ?? chain ?? undefined;
    })
    .filter((item): item is string => Boolean(item));

  if (summaries.length === 0) {
    return undefined;
  }

  return summaries.join(' | ');
}

export function buildProjectJsonLd(
  id: string,
  data: ProjectStructuredData,
): Record<string, unknown> | null {
  const pagePath = `/project/${id}`;
  const pageUrl = buildAbsoluteUrl(pagePath);
  const siteRoot = buildAbsoluteUrl('/');
  const imageUrl = resolveImageUrl(data.logoUrl);

  const keywordSet = new Set<string>();
  for (const entry of data.tags) {
    if (entry) {
      keywordSet.add(entry);
    }
  }
  for (const entry of data.categories) {
    if (entry) {
      keywordSet.add(entry);
    }
  }

  const keywords = Array.from(keywordSet);

  const creators = data.founders
    .filter((founder) => toDisplayString(founder.name))
    .map((founder) => ({
      '@type': 'Person',
      name: toDisplayString(founder.name),
      ...(toDisplayString(founder.title)
        ? { jobTitle: toDisplayString(founder.title) }
        : {}),
    }));

  const sameAsSet = new Set<string>();
  const addSameAs = (value?: string | null) => {
    const url = normalizeUrlForJsonLd(value);
    if (url) {
      sameAsSet.add(url);
    }
  };

  for (const site of data.websites) {
    addSameAs(site.url);
  }
  data.socialLinks.forEach(addSameAs);
  addSameAs(data.appUrl);
  addSameAs(data.codeRepo);
  addSameAs(data.whitePaper);

  const sameAs = Array.from(sameAsSet);

  const propertyMap = new Map<string, string>();
  const addProperty = (label: string, value?: string | undefined) => {
    const displayValue = toDisplayString(value);
    if (!displayValue) {
      return;
    }
    if (!propertyMap.has(label)) {
      propertyMap.set(label, displayValue);
    }
  };

  for (const property of data.additionalProperties) {
    if (ADDITIONAL_PROPERTY_IGNORED_KEYS.has(property.name)) {
      continue;
    }
    addProperty(formatKeyForDisplay(property.name), property.value);
  }

  addProperty('Organization Structure', data.orgStructure);
  addProperty('Public Goods', booleanToText(data.publicGoods));
  addProperty('Development Status', data.devStatus);
  addProperty('Funding Status', data.fundingStatus);
  addProperty('Open Source', booleanToText(data.openSource));
  addProperty('Application URL', data.appUrl);
  addProperty('Code Repository', data.codeRepo);
  addProperty('White Paper', data.whitePaper);
  addProperty('Token Contract', data.tokenContract);
  addProperty(
    'Smart Contracts',
    buildSmartContractsSummary(data.dappSmartContracts),
  );

  const additionalProperty = Array.from(propertyMap.entries()).map(
    ([name, value]) => ({
      '@type': 'PropertyValue',
      name,
      value,
    }),
  );

  const description =
    toDisplayString(data.mainDescription) ??
    toDisplayString(data.tagline) ??
    toDisplayString(data.name);

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Project',
    '@id': `${pageUrl}#project`,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    image: imageUrl,
    provider: {
      '@id': `${siteRoot}#organization`,
    },
  };

  if (data.name) {
    jsonLd.name = data.name;
  }
  if (data.tagline) {
    jsonLd.alternateName = data.tagline;
  }
  if (description) {
    jsonLd.description = description;
  }
  if (keywords.length > 0) {
    jsonLd.keywords = keywords.join(', ');
    jsonLd.knowsAbout = keywords;
  }
  if (creators.length > 0) {
    jsonLd.founder = creators;
  }
  if (data.dateFounded) {
    jsonLd.foundingDate = data.dateFounded;
  }
  if (data.dateLaunch) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Launch Date',
      value: data.dateLaunch,
    });
  }
  if (sameAs.length > 0) {
    jsonLd.sameAs = sameAs;
  }
  if (additionalProperty.length > 0) {
    jsonLd.additionalProperty = additionalProperty;
  }

  return jsonLd;
}
