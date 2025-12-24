'use client';

import { Extension } from '@tiptap/core';
import MarkdownIt from 'markdown-it';
import { MarkdownParser, type ParseSpec } from 'prosemirror-markdown';
import type { Schema } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

const markdownIt = MarkdownIt('commonmark', {
  html: false,
  breaks: true,
  linkify: false,
});

const MARKDOWN_PATTERNS = [
  /^#{1,6}\s+/m, // headings
  /^>\s+/m, // blockquotes
  /^[*\-+]\s+/m, // unordered list
  /^\s{0,3}\d+\.\s+/m, // ordered list
  /```[\s\S]*?```/, // fenced code
  /`[^`]+`/, // inline code
  /\*\*[^*]+\*\*/, // bold
  /\*[^*]+\*/, // italic
  /\[([^\]]+)\]\(([^)]+)\)/, // markdown link
];

const containsMarkdownSyntax = (text: string) =>
  MARKDOWN_PATTERNS.some((pattern) => pattern.test(text));

const createTokenMap = (schema: Schema): Record<string, ParseSpec> => {
  const tokens: Record<string, ParseSpec> = {
    blockquote: { block: 'blockquote' },
    paragraph: { block: 'paragraph' },
  };

  if (schema.nodes.listItem) {
    tokens.list_item = { block: 'listItem' };
  }

  if (schema.nodes.bulletList) {
    tokens.bullet_list = { block: 'bulletList' };
  }

  if (schema.nodes.orderedList) {
    tokens.ordered_list = {
      block: 'orderedList',
      getAttrs: (token) => ({
        start: Number(token.attrGet('start')) || 1,
      }),
    };
  }

  if (schema.nodes.heading) {
    tokens.heading = {
      block: 'heading',
      getAttrs: (token) => ({
        level: Number(token.tag.slice(1)),
      }),
    };
  }

  if (schema.nodes.codeBlock) {
    tokens.code_block = { block: 'codeBlock', noCloseToken: true };
    tokens.fence = {
      block: 'codeBlock',
      getAttrs: (token) => ({
        language: token.info || null,
      }),
      noCloseToken: true,
    };
  }

  if (schema.nodes.horizontalRule) {
    tokens.hr = { node: 'horizontalRule' };
  }

  if (schema.nodes.hardBreak) {
    tokens.hardbreak = { node: 'hardBreak' };
  }

  if (schema.marks.bold) {
    tokens.strong = { mark: 'bold' };
  }

  if (schema.marks.italic) {
    tokens.em = { mark: 'italic' };
  }

  if (schema.marks.strike) {
    tokens.s = { mark: 'strike' };
  }

  if (schema.marks.code) {
    tokens.code_inline = { mark: 'code', noCloseToken: true };
  }

  if (schema.marks.link) {
    tokens.link = {
      mark: 'link',
      getAttrs: (token) => ({
        href: token.attrGet('href') || '',
        target: '_blank',
        rel: 'noopener noreferrer',
      }),
    };
  }

  return tokens;
};

const createMarkdownParser = (schema: Schema) =>
  new MarkdownParser(schema, markdownIt, createTokenMap(schema));

const replaceSelectionWithMarkdown = (
  view: EditorView,
  parser: MarkdownParser,
  text: string,
): boolean => {
  const doc = parser.parse(text);
  if (!doc) return false;

  const slice = doc.slice(0, doc.content.size);
  const transaction = view.state.tr.replaceSelection(slice).scrollIntoView();
  view.dispatch(transaction);
  view.focus();
  return true;
};

export const MarkdownPastePlugin = Extension.create({
  name: 'markdownPasteHandler',

  addProseMirrorPlugins() {
    const parser = createMarkdownParser(this.editor.schema);

    return [
      new Plugin({
        key: new PluginKey('markdownPasteHandler'),
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData('text/plain') ?? '';
            if (!text.trim()) return false;

            if (!containsMarkdownSyntax(text)) {
              return false;
            }

            event.preventDefault();

            try {
              return replaceSelectionWithMarkdown(view, parser, text);
            } catch (error) {
              console.error('Failed to parse markdown paste', error);
              return false;
            }
          },
        },
      }),
    ];
  },
});
