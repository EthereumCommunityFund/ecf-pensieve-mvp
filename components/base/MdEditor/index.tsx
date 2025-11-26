'use client';

import { cn, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import {
  Link as LinkIcon,
  ListBullets,
  ListNumbers,
  Quotes,
  TextB as TextBold,
  TextHOne,
  TextHThree,
  TextHTwo,
  TextItalic,
} from '@phosphor-icons/react';
import Link from '@tiptap/extension-link';
import {
  EditorContent,
  type EditorContentProps,
  useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '../button';
import { Input } from '../input';

import { MarkdownPastePlugin } from './mdPasteHandler';

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
  isEdit?: boolean;
  onClick?: () => void;
  collapsable?: boolean;
  collapseHeight?: number;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  debounceMs?: number; // 新增：防抖时间配置
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

const isValidEditorValue = (value: any): value is EditorValue => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.content === 'string' &&
    (value.type === 'doc' || value.type === 'text') &&
    typeof value.isEmpty === 'boolean'
  );
};

const LinkInput = ({ editor, isOpen }: { editor: any; isOpen: boolean }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      const previousUrl = editor.getAttributes('link').href;
      setUrl(previousUrl || '');
    }
  }, [isOpen, editor]);

  const addLink = () => {
    if (!url || !editor) return;

    let processedUrl = url.trim();
    if (processedUrl.startsWith('www.')) {
      processedUrl = `https://${processedUrl}`;
    }

    const { empty, from, to } = editor.state.selection;
    if (empty) {
      return;
    }

    const isUpdatingLink = editor.isActive('link');

    const { state, view } = editor;
    const { tr } = state;
    const linkMark = state.schema.marks.link.create({ href: processedUrl });

    let transaction = tr.addMark(from, to, linkMark);

    if (!isUpdatingLink) {
      transaction = transaction.setSelection(
        state.selection.constructor.near(transaction.doc.resolve(to)),
      );

      transaction = transaction.insertText(' ', to);

      transaction = transaction.removeStoredMark(linkMark);
    }

    view.dispatch(transaction);

    view.focus();

    setUrl('');
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setUrl('');
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      <Input
        size="sm"
        placeholder="Enter link URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addLink();
          }
        }}
      />
      <div className="flex gap-2">
        <Button size="sm" color="primary" onPress={addLink}>
          {editor.isActive('link') ? 'Update Link' : 'Add Link'}
        </Button>
        {editor.isActive('link') && (
          <Button size="sm" color="secondary" onPress={removeLink}>
            Remove Link
          </Button>
        )}
      </div>
    </div>
  );
};

const EditorContentComponent =
  EditorContent as unknown as React.ComponentType<EditorContentProps>;

const MenuBar = ({
  editor,
  className,
}: {
  editor: any;
  className?: string;
}) => {
  const [isLinkOpen, setIsLinkOpen] = useState(false);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-wrap gap-1 border-b border-white/10 p-[10px]',
        className,
      )}
    >
      <Button
        isIconOnly
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          'bg-transparent hover:bg-[#363636]',
          editor.isActive('heading', { level: 1 }) && 'bg-[#363636]',
          'p-[5px]',
        )}
        title="Heading 1"
      >
        <TextHOne size={20} />
      </Button>
      <Button
        isIconOnly
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          'bg-transparent hover:bg-[#363636]',
          editor.isActive('heading', { level: 2 }) && 'bg-[#363636]',
          'p-[5px]',
        )}
        title="Heading 2"
      >
        <TextHTwo size={20} />
      </Button>
      <Button
        isIconOnly
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          'bg-transparent hover:bg-[#363636]',
          editor.isActive('heading', { level: 3 }) && 'bg-[#363636]',
          'p-[5px]',
        )}
        title="Heading 3"
      >
        <TextHThree size={20} />
      </Button>
      <div className="mx-1 my-auto h-6 w-px bg-white/10" />
      <Button
        isIconOnly
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          'bg-transparent hover:bg-[#363636]',
          editor.isActive('bold') && 'bg-[#363636]',
          'p-[5px]',
        )}
        title="Bold"
      >
        <TextBold size={20} />
      </Button>
      <Button
        isIconOnly
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          'bg-transparent hover:bg-[#363636]',
          editor.isActive('italic') && 'bg-[#363636]',
          'p-[5px]',
        )}
        title="Italic"
      >
        <TextItalic size={20} />
      </Button>
      <div className="mx-1 my-auto h-6 w-px bg-white/10" />
      <Button
        isIconOnly
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          'bg-transparent hover:bg-[#363636]',
          editor.isActive('bulletList') && 'bg-[#363636]',
          'p-[5px]',
        )}
        title="Bullet List"
      >
        <ListBullets size={20} />
      </Button>
      <Button
        isIconOnly
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          'bg-transparent hover:bg-[#363636]',
          editor.isActive('orderedList') && 'bg-[#363636]',
          'p-[5px]',
        )}
        title="Ordered List"
      >
        <ListNumbers size={20} />
      </Button>
      <Button
        isIconOnly
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          'bg-transparent hover:bg-[#363636]',
          editor.isActive('blockquote') && 'bg-[#363636]',
          'p-[5px]',
        )}
        title="Quote"
      >
        <Quotes size={20} />
      </Button>
      <Popover
        isOpen={isLinkOpen}
        onOpenChange={(open) => {
          setIsLinkOpen(open);
        }}
      >
        <PopoverTrigger>
          <Button
            isIconOnly
            size="sm"
            className={cn(
              'bg-transparent hover:bg-[#363636]',
              editor.isActive('link') && 'bg-[#363636]',
              'p-[5px]',
            )}
            title={editor.isActive('link') ? 'Edit Link' : 'Add Link'}
          >
            <LinkIcon size={20} />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <LinkInput editor={editor} isOpen={isLinkOpen} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const defaultValue = JSON.stringify({
  content: '',
  type: 'doc',
  isEmpty: true,
});

const MdEditor: React.FC<MdEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Write about your issue',
  className,
  hideMenuBar = false,
  isEdit = true,
  onClick,
  collapsable = false,
  collapseHeight = 150,
  collapsed = false,
  onCollapse,
  debounceMs = 300, // 默认300ms防抖
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 防抖的 onChange 处理函数
  const debouncedOnChange = useCallback(
    (html: string) => {
      // 清除之前的定时器
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // 设置新的定时器
      debounceTimeoutRef.current = setTimeout(() => {
        const contentIsEmpty = isContentEmpty(html);
        const jsonValue: EditorValue = {
          content: html,
          type: 'doc',
          isEmpty: contentIsEmpty,
        };
        onChange?.(JSON.stringify(jsonValue));
      }, debounceMs);
    },
    [onChange, debounceMs],
  );

  // 清理函数
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const editorValue = React.useMemo(() => {
    if (!value) return JSON.parse(defaultValue);
    try {
      const parsedValue = JSON.parse(value);

      if (!isValidEditorValue(parsedValue)) {
        return JSON.parse(defaultValue);
      }

      const contentIsEmpty = isContentEmpty(parsedValue.content);
      return {
        ...parsedValue,
        isEmpty: contentIsEmpty,
      };
    } catch (e) {
      return JSON.parse(defaultValue);
    }
  }, [value]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'custom-bullet-list pl-4 my-[10px] list-disc',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'custom-ordered-list pl-4 my-[10px] list-decimal',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'custom-blockquote border-l-[3px] border-white/20 my-6 pl-4',
          },
        },
        code: {
          HTMLAttributes: {
            class:
              'custom-code bg-[#1f1f1f] rounded-[0.4rem] text-[0.85rem] px-[0.3em] py-[0.25em]',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'custom-code-block bg-[#1f1f1f] rounded-[0.5rem] my-6 p-4',
          },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'custom-heading',
          },
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'custom-link underline cursor-pointer transition-colors',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        autolink: true,
        linkOnPaste: true,
      }),
      MarkdownPastePlugin,
    ],
    content: editorValue.content,
    editable: isEdit,
    editorProps: {
      attributes: {
        class: cn(
          'tiptap prose prose-invert max-w-none focus:outline-none',
          '[&_.tiptap]:first:mt-0',
          '[&_h1]:text-[2rem] [&_h1]:leading-[1.4]',
          '[&_h2]:text-[1.6rem] [&_h2]:leading-[1.4]',
          '[&_h3]:text-[1.4rem] [&_h3]:leading-[1.4]',
          !isEdit && 'cursor-default',
          className,
        ),
      },
    },
    onUpdate: ({ editor }) => {
      if (!isEdit || !isInitialized) return;
      const html = editor.getHTML();
      debouncedOnChange(html);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;

    // Only sync external content when editor is NOT focused.
    // This avoids resetting selection or affecting typing/newline behavior.
    if (editor.isFocused) return;

    if (editorValue.content !== editor.getHTML()) {
      // Check if content contains HTML tags
      const isHTML = /<[^>]+>/.test(editorValue.content);

      if (isHTML) {
        // If it's HTML, set it directly
        editor.commands.setContent(editorValue.content);
      } else {
        // If it's plain text, handle paragraph breaks properly
        const htmlContent = editorValue.content
          .trim()
          .replace(/\n\n/g, '<br><br>') // 双换行转为段落分隔
          .replace(/\n/g, '<br>') // 单换行转为 <br>
          .replace(/^/, '<p>') // 开头加 <p>
          .replace(/$/, '</p>'); // 结尾加 </p>

        editor.commands.setContent(htmlContent || '<p></p>');
      }
    }
  }, [editorValue.content, editor]);

  useEffect(() => {
    if (editor) {
      setIsInitialized(true);
    }
  }, [editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEdit);
    }
  }, [isEdit, editor]);

  const [canCollapse, setCanCollapse] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!collapsable || isEdit || !contentRef.current) return;

    const checkHeight = () => {
      const contentHeight = contentRef.current?.scrollHeight || 0;
      const shouldCollapse = contentHeight > collapseHeight * 1.5;

      setCanCollapse(shouldCollapse);

      if (shouldCollapse) {
        onCollapse?.(shouldCollapse);
      }
    };

    setTimeout(checkHeight, 100);

    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, [
    collapsable,
    isEdit,
    collapseHeight,
    editor,
    editorValue.content,
    onCollapse,
  ]);

  return (
    <div className="size-full">
      <div
        className={cn(
          'rounded-lg bg-white/[0.02]',
          collapsable &&
            !isEdit &&
            canCollapse &&
            collapsed &&
            'overflow-hidden',
          className?.base,
        )}
        onClick={onClick}
        style={
          collapsable && !isEdit && canCollapse && collapsed
            ? { maxHeight: `${collapseHeight}px` }
            : undefined
        }
      >
        {isEdit && !hideMenuBar && (
          <MenuBar editor={editor} className={className?.menuBar} />
        )}
        <div
          ref={contentRef}
          className={cn(
            'relative p-[10px]',
            collapsable &&
              !isEdit &&
              canCollapse &&
              'transition-all duration-300',
            isEdit && 'min-h-[20px]',
            className?.editorWrapper,
          )}
          onClick={(e) => {
            e.stopPropagation();
            editor?.commands.focus();
          }}
        >
          <EditorContentComponent
            editor={editor}
            className={className?.editor}
          />
          {editorValue.isEmpty && isEdit && (
            <div className="pointer-events-none absolute left-[10px] top-[10px] text-[16px] text-white/50">
              <span className="text-black/60">{placeholder}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MdEditor;
