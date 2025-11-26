'use client';

import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import { useEffect, useMemo, useRef, useState } from 'react';

// --- Tiptap Core Extensions ---
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Selection } from '@tiptap/extensions';
import { StarterKit } from '@tiptap/starter-kit';

// --- UI Primitives ---
import { Button } from '@/components/base/MdEditor/tiptap-ui-primitive/button';
import { Spacer } from '@/components/base/MdEditor/tiptap-ui-primitive/spacer';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/base/MdEditor/tiptap-ui-primitive/toolbar';

// --- Tiptap Node ---
import '@/components/base/MdEditor/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/base/MdEditor/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/base/MdEditor/tiptap-node/heading-node/heading-node.scss';
import { HorizontalRule } from '@/components/base/MdEditor/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension';
import '@/components/base/MdEditor/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/base/MdEditor/tiptap-node/image-node/image-node.scss';
import { ImageUploadNode } from '@/components/base/MdEditor/tiptap-node/image-upload-node/image-upload-node-extension';
import '@/components/base/MdEditor/tiptap-node/list-node/list-node.scss';
import '@/components/base/MdEditor/tiptap-node/paragraph-node/paragraph-node.scss';

// --- Tiptap UI ---
import { BlockquoteButton } from '@/components/base/MdEditor/tiptap-ui/blockquote-button';
import { CodeBlockButton } from '@/components/base/MdEditor/tiptap-ui/code-block-button';
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from '@/components/base/MdEditor/tiptap-ui/color-highlight-popover';
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

// --- Icons ---
import { ArrowLeftIcon } from '@/components/base/MdEditor/tiptap-icons/arrow-left-icon';
import { HighlighterIcon } from '@/components/base/MdEditor/tiptap-icons/highlighter-icon';
import { LinkIcon } from '@/components/base/MdEditor/tiptap-icons/link-icon';

// --- Hooks ---
import { useCursorVisibility } from '@/hooks/use-cursor-visibility';
import { useIsBreakpoint } from '@/hooks/use-is-breakpoint';
import { useWindowSize } from '@/hooks/use-window-size';

// --- Components ---
import { ThemeToggle } from '@/components/base/MdEditor/tiptap-templates/simple/theme-toggle';

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';

// --- Styles ---
import '@/components/base/MdEditor/tiptap-templates/simple/simple-editor.scss';

import content from '@/components/base/MdEditor/tiptap-templates/simple/data/content.json';

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={['bulletList', 'orderedList', 'taskList']}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup> */}

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: 'highlighter' | 'link';
  onBack: () => void;
}) => (
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
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

type MobileViewMode = 'main' | 'highlighter' | 'link';

interface SimpleEditorToolbarProps {
  isMobile: boolean;
  mobileView: MobileViewMode;
  setMobileView: (view: MobileViewMode) => void;
}

const SimpleEditorToolbar = ({
  isMobile,
  mobileView,
  setMobileView,
}: SimpleEditorToolbarProps) => {
  const { editor } = useCurrentEditor();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { height } = useWindowSize();
  const overlayHeight = toolbarRef.current?.getBoundingClientRect().height ?? 0;

  const rect = useCursorVisibility({
    editor,
    overlayHeight,
  });

  return (
    <Toolbar
      ref={toolbarRef}
      style={
        isMobile
          ? {
              bottom: `calc(100% - ${height - rect.y}px)`,
            }
          : undefined
      }
    >
      {mobileView === 'main' ? (
        <MainToolbarContent
          onHighlighterClick={() => setMobileView('highlighter')}
          onLinkClick={() => setMobileView('link')}
          isMobile={isMobile}
        />
      ) : (
        <MobileToolbarContent
          type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
          onBack={() => setMobileView('main')}
        />
      )}
    </Toolbar>
  );
};

export function SimpleEditor() {
  const isMobile = useIsBreakpoint();
  const [mobileView, setMobileView] = useState<MobileViewMode>('main');

  const editorProps = useMemo(
    () => ({
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Main content area, start typing to enter text.',
        class: 'simple-editor',
      },
    }),
    [],
  );

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
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
    ],
    [handleImageUpload],
  );

  useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main');
    }
  }, [isMobile, mobileView]);

  return (
    <div className="simple-editor-wrapper">
      <EditorProvider
        content={content}
        editorProps={editorProps}
        extensions={extensions}
        immediatelyRender={false}
        slotBefore={
          <SimpleEditorToolbar
            isMobile={isMobile}
            mobileView={mobileView}
            setMobileView={setMobileView}
          />
        }
        editorContainerProps={{
          role: 'presentation',
          className: 'simple-editor-content',
        }}
      />
    </div>
  );
}
