'use client';

import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import TiptapLink from '@tiptap/extension-link';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Selection } from '@tiptap/extensions';
import type { Editor, EditorContentProps } from '@tiptap/react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { ComponentType } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ArrowLeftIcon } from '@/components/base/MdEditor/tiptap-icons/arrow-left-icon';
import { HighlighterIcon } from '@/components/base/MdEditor/tiptap-icons/highlighter-icon';
import { LinkIcon } from '@/components/base/MdEditor/tiptap-icons/link-icon';
import { HorizontalRule } from '@/components/base/MdEditor/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension';
import { ImageUploadNode } from '@/components/base/MdEditor/tiptap-node/image-upload-node/image-upload-node-extension';
import { Button } from '@/components/base/MdEditor/tiptap-ui-primitive/button';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/base/MdEditor/tiptap-ui-primitive/toolbar';
import { BlockquoteButton } from '@/components/base/MdEditor/tiptap-ui/blockquote-button';
import { ColorHighlightPopoverContent } from '@/components/base/MdEditor/tiptap-ui/color-highlight-popover';
import { HeadingDropdownMenu } from '@/components/base/MdEditor/tiptap-ui/heading-dropdown-menu';
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from '@/components/base/MdEditor/tiptap-ui/link-popover';
import { ListDropdownMenu } from '@/components/base/MdEditor/tiptap-ui/list-dropdown-menu';
import { MarkButton } from '@/components/base/MdEditor/tiptap-ui/mark-button';
import { TextAlignButton } from '@/components/base/MdEditor/tiptap-ui/text-align-button';
import { UndoRedoButton } from '@/components/base/MdEditor/tiptap-ui/undo-redo-button';
import { useCursorVisibility } from '@/hooks/use-cursor-visibility';
import { useIsBreakpoint } from '@/hooks/use-is-breakpoint';
import { useWindowSize } from '@/hooks/use-window-size';
import { cn, handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';

import '@/components/base/MdEditor/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/base/MdEditor/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/base/MdEditor/tiptap-node/heading-node/heading-node.scss';
import '@/components/base/MdEditor/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/base/MdEditor/tiptap-node/image-node/image-node.scss';
import '@/components/base/MdEditor/tiptap-node/list-node/list-node.scss';
import '@/components/base/MdEditor/tiptap-node/paragraph-node/paragraph-node.scss';

import '@/components/base/MdEditor/md-editor.scss';
import { MarkdownPastePlugin } from '@/components/base/MdEditor/mdPasteHandler';

const EditorContentComponent =
  EditorContent as unknown as ComponentType<EditorContentProps>;

type MdEditorMode = 'edit' | 'readonly';

interface EditorValue {
  content: string;
  type: 'doc' | 'text';
  isEmpty: boolean;
}

export interface MdEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: {
    base?: string;
    menuBar?: string;
    editorWrapper?: string;
    editor?: string;
  };
  hideMenuBar?: boolean;
  mode?: MdEditorMode;
  isEdit?: boolean;
  onClick?: () => void;
  collapsable?: boolean;
  collapseHeight?: number;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  debounceMs?: number;
}

const isContentEmpty = (content: string): boolean => {
  const plainText = content
    .replace(/<br\s*\/?>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plainText.length === 0;
};

const isValidEditorValue = (value: unknown): value is EditorValue => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<EditorValue>;
  return (
    typeof candidate.content === 'string' &&
    (candidate.type === 'doc' || candidate.type === 'text') &&
    typeof candidate.isEmpty === 'boolean'
  );
};

type MobileViewMode = 'main' | 'highlighter' | 'link';

interface MainToolbarContentProps {
  editor: Editor | null;
  isMobile: boolean;
  onHighlighterClick: () => void;
  onLinkClick: () => void;
}

const MainToolbarContent = ({
  editor,
  isMobile,
  onHighlighterClick,
  onLinkClick,
}: MainToolbarContentProps) => {
  if (!editor) return null;

  return (
    <>
      {/* <Spacer /> */}

      <ToolbarGroup>
        <UndoRedoButton editor={editor} action="undo" />
        <UndoRedoButton editor={editor} action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu
          editor={editor}
          levels={[1, 2, 3, 4]}
          portal={isMobile}
        />
        <ListDropdownMenu
          editor={editor}
          types={['bulletList', 'orderedList', 'taskList']}
          portal={isMobile}
        />
        <BlockquoteButton editor={editor} />
        {/* <CodeBlockButton editor={editor} /> */}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton editor={editor} type="bold" />
        <MarkButton editor={editor} type="italic" />
        <MarkButton editor={editor} type="strike" />
        {/* <MarkButton editor={editor} type="code" /> */}
        <MarkButton editor={editor} type="underline" />
        {/* {!isMobile ? (
          <ColorHighlightPopover editor={editor} />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )} */}
        {!isMobile ? (
          <LinkPopover editor={editor} />
        ) : (
          <LinkButton onClick={onLinkClick} />
        )}
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* <ToolbarGroup>
        <MarkButton editor={editor} type="superscript" />
        <MarkButton editor={editor} type="subscript" />
      </ToolbarGroup> */}

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton editor={editor} align="left" />
        <TextAlignButton editor={editor} align="center" />
        <TextAlignButton editor={editor} align="right" />
        <TextAlignButton editor={editor} align="justify" />
      </ToolbarGroup>

      {/* <Spacer /> */}
    </>
  );
};

interface MobileToolbarContentProps {
  editor: Editor | null;
  type: 'highlighter' | 'link';
  onBack: () => void;
}

const MobileToolbarContent = ({
  editor,
  type,
  onBack,
}: MobileToolbarContentProps) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === 'highlighter' ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? (
      <ColorHighlightPopoverContent editor={editor} />
    ) : (
      <LinkContent editor={editor} />
    )}
  </>
);

interface MdEditorToolbarProps {
  editor: Editor | null;
  isMobile: boolean;
  mobileView: MobileViewMode;
  setMobileView: (mode: MobileViewMode) => void;
  className?: string;
}

const MdEditorToolbar = ({
  editor,
  isMobile,
  mobileView,
  setMobileView,
  className,
}: MdEditorToolbarProps) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { height } = useWindowSize();
  const overlayHeight = toolbarRef.current?.getBoundingClientRect().height ?? 0;
  const rect = useCursorVisibility({ editor, overlayHeight });

  if (!editor) {
    return null;
  }

  const mobileOffset = Math.max(0, height - rect.y);
  const toolbarStyle = isMobile
    ? { bottom: `calc(100% - ${mobileOffset}px)` }
    : undefined;

  return (
    <Toolbar ref={toolbarRef} className={className} style={toolbarStyle}>
      {mobileView === 'main' ? (
        <MainToolbarContent
          editor={editor}
          isMobile={isMobile}
          onHighlighterClick={() => setMobileView('highlighter')}
          onLinkClick={() => setMobileView('link')}
        />
      ) : (
        <MobileToolbarContent
          editor={editor}
          type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
          onBack={() => setMobileView('main')}
        />
      )}
    </Toolbar>
  );
};

const defaultValue = JSON.stringify({
  content: '',
  type: 'doc',
  isEmpty: true,
});

const MdEditor = ({
  value = '',
  onChange,
  placeholder = 'Write about your issue',
  className,
  hideMenuBar = false,
  mode,
  isEdit = true,
  onClick,
  collapsable = false,
  collapseHeight = 150,
  collapsed = false,
  onCollapse,
  debounceMs = 300,
}: MdEditorProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const isEditable = mode ? mode === 'edit' : isEdit;
  const [mobileView, setMobileView] = useState<MobileViewMode>('main');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsBreakpoint();
  const contentRef = useRef<HTMLDivElement>(null);
  const [canCollapse, setCanCollapse] = useState(false);

  useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main');
    }
  }, [isMobile, mobileView]);

  const debouncedOnChange = useCallback(
    (html: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        const contentIsEmpty = isContentEmpty(html);
        const payload: EditorValue = {
          content: html,
          type: 'doc',
          isEmpty: contentIsEmpty,
        };
        onChange?.(JSON.stringify(payload));
      }, debounceMs);
    },
    [debounceMs, onChange],
  );

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const editorValue = useMemo(() => {
    if (!value) return JSON.parse(defaultValue) as EditorValue;
    try {
      const parsed = JSON.parse(value);
      if (!isValidEditorValue(parsed)) {
        return JSON.parse(defaultValue) as EditorValue;
      }
      return {
        ...parsed,
        isEmpty: isContentEmpty(parsed.content),
      };
    } catch {
      return JSON.parse(defaultValue) as EditorValue;
    }
  }, [value]);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        horizontalRule: false,
        link: false,
      }),
      TiptapLink.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error('Upload failed:', error),
      }),
      MarkdownPastePlugin,
    ],
    [handleImageUpload],
  );

  const editor = useEditor({
    extensions,
    content: editorValue.content,
    editable: isEditable,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'data-placeholder': placeholder,
        'aria-label': placeholder,
        class: cn(
          'tiptap prose prose-invert max-w-none focus:outline-none',
          '[&_.tiptap]:first:mt-0',
          '[&_h1]:text-[2rem] [&_h1]:leading-[1.4]',
          '[&_h2]:text-[1.6rem] [&_h2]:leading-[1.4]',
          '[&_h3]:text-[1.4rem] [&_h3]:leading-[1.4]',
          !isEditable && 'cursor-default',
        ),
      },
    },
    onUpdate: ({ editor: instance }) => {
      if (!isEditable || !isInitialized) return;
      const html = instance.getHTML();
      debouncedOnChange(html);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editorValue.content === editor?.getHTML() || !editor) return;

    if (/<[^>]+>/.test(editorValue.content)) {
      editor.commands.setContent(editorValue.content);
    } else {
      const htmlContent = editorValue.content
        .trim()
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');

      editor.commands.setContent(htmlContent || '<p></p>');
    }
  }, [editor, editorValue.content]);

  useEffect(() => {
    if (editor) {
      setIsInitialized(true);
    }
  }, [editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [editor, isEditable]);

  useEffect(() => {
    if (!collapsable || isEditable || !contentRef.current) return;

    const checkHeight = () => {
      const contentHeight = contentRef.current?.scrollHeight || 0;
      const shouldCollapse = contentHeight > collapseHeight * 1.5;
      setCanCollapse(shouldCollapse);
      if (shouldCollapse) {
        onCollapse?.(shouldCollapse);
      }
    };

    const timeout = window.setTimeout(checkHeight, 100);
    window.addEventListener('resize', checkHeight);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('resize', checkHeight);
    };
  }, [
    collapsable,
    collapseHeight,
    editorValue.content,
    isEditable,
    onCollapse,
  ]);

  const shouldShowToolbar = isEditable && !hideMenuBar;

  return (
    <div className="md-editor-root w-full">
      <div
        className={cn(
          'md-editor-container relative flex flex-col rounded-lg bg-white/[0.02]',
          collapsable &&
            !isEditable &&
            canCollapse &&
            collapsed &&
            'overflow-hidden',
          className?.base,
        )}
        onClick={onClick}
        style={
          collapsable && !isEditable && canCollapse && collapsed
            ? { maxHeight: `${collapseHeight}px` }
            : undefined
        }
      >
        {shouldShowToolbar && (
          <MdEditorToolbar
            editor={editor}
            isMobile={isMobile}
            mobileView={mobileView}
            setMobileView={setMobileView}
            className={className?.menuBar}
          />
        )}

        <div
          ref={contentRef}
          className={cn(
            'md-editor-content relative',
            collapsable &&
              !isEditable &&
              canCollapse &&
              'transition-all duration-300',
            isEditable && 'min-h-[20px]',
            className?.editorWrapper,
          )}
          onClick={(event) => {
            event.stopPropagation();
            editor?.commands.focus();
          }}
        >
          <EditorContentComponent
            editor={editor}
            className={cn('md-editor-prose ', className?.editor)}
          />
        </div>
      </div>
    </div>
  );
};

export default MdEditor;
