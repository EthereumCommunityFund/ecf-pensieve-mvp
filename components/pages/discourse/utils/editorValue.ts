import { stripHtmlToPlainText } from './threadTransforms';

export const EDITOR_MAX_CHARACTERS = 4000;

export type ParsedEditorValue = {
  html: string;
  plain: string;
};

export const parseEditorValue = (rawValue: string): ParsedEditorValue => {
  if (!rawValue) return { html: '', plain: '' };

  let html = rawValue;
  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed.content === 'string') {
      html = parsed.content;
    }
  } catch {
    // fall back to raw value
  }

  return {
    html,
    plain: stripHtmlToPlainText(html).trim(),
  };
};
