'use client';

import { ArrowLeft, WarningCircle } from '@phosphor-icons/react';
import { Dispatch, SetStateAction, useMemo } from 'react';

import { Button } from '@/components/base';
import MdEditor from '@/components/base/MdEditor';

import { CategorySelector } from './CategorySelector';
import { DiscourseTopicOption } from './topicOptions';

const MAX_TITLE = 40;
const MAX_BODY = 4000;

const stripHtml = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

type CreatePostProps = {
  title: string;
  body: string;
  bodyHtml: string;
  selectedCategory?: DiscourseTopicOption;
  tags: string[];
  tagInput: string;
  isScam: boolean;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onCategoryChange: (category?: DiscourseTopicOption) => void;
  onTagsChange: Dispatch<SetStateAction<string[]>>;
  onTagInputChange: (value: string) => void;
  onIsScamChange: (value: boolean) => void;
  onPreview: () => void;
  onPublish: () => void;
  onBack: () => void;
  onDiscard?: () => void;
  isPublishDisabled: boolean;
};

export function CreatePost({
  title,
  body,
  bodyHtml,
  selectedCategory,
  tags,
  tagInput,
  isScam,
  onTitleChange,
  onBodyChange,
  onCategoryChange,
  onTagsChange,
  onTagInputChange,
  onIsScamChange,
  onPreview,
  onPublish,
  onBack,
  onDiscard,
  isPublishDisabled,
}: CreatePostProps) {
  const remainingTitle = MAX_TITLE - title.length;
  const remainingBody = useMemo(
    () => MAX_BODY - stripHtml(bodyHtml).length,
    [bodyHtml],
  );

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const nextTag = tagInput.trim();
    onTagsChange((prev) => Array.from(new Set([...prev, nextTag])));
    onTagInputChange('');
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange((prev) => prev.filter((item) => item !== tag));
  };

  const toggleScam = () => onIsScamChange(!isScam);

  return (
    <div className="flex flex-col items-center gap-[20px]">
      <div className="flex w-full flex-wrap items-center gap-3 text-[14px] text-black/60">
        <Button
          onPress={onBack}
          className="flex items-center gap-2 rounded-[6px] border-none px-3 py-1 text-[14px] font-semibold text-black hover:bg-black/5"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </Button>
        <span>Project Name</span>
        <span>/</span>
        <span>Discussions</span>
        <span>/</span>
        <span className="font-semibold text-black">Create Post</span>
      </div>

      <div className="tablet:max-a-auto mobile:max-w-auto flex w-full max-w-[700px] flex-col gap-8 rounded-[20px] px-10 py-8">
        <div className="flex flex-col gap-1">
          <label className="text-[16px] font-semibold text-black">Title</label>
          <input
            value={title}
            onChange={(event) =>
              onTitleChange(event.target.value.slice(0, MAX_TITLE))
            }
            placeholder="Type a title for your thread"
            className="h-10 rounded-[8px] border border-black/10 bg-black/5 px-4 text-[14px] text-black/80 placeholder:text-black/40 focus:border-black/40 focus:outline-none"
          />
          <p className="text-right text-xs text-black/60">
            {remainingTitle} characters remaining
          </p>
        </div>

        <div className="flex flex-col gap-[10px]">
          <label className="text-[16px] font-semibold text-black">Post</label>
          <MdEditor
            value={body}
            onChange={(value) => onBodyChange(value)}
            debounceMs={500}
            className={{
              base: 'min-h-[280px] rounded-[12px] border border-black/10 bg-black/5',
              editorWrapper: 'p-0',
              editor: 'prose prose-sm max-w-none text-[#1b1b1f]',
            }}
          />
          <div className="flex items-center justify-between text-xs text-black/60">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex items-center rounded-[4px] bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                MD
              </span>
              Markdown Available
            </span>
            <span>{remainingBody} characters remaining</span>
          </div>
        </div>

        <CategorySelector
          value={selectedCategory?.value}
          onChange={(category) => onCategoryChange(category)}
        />

        <div className="flex items-center justify-between rounded-[8px] border border-black/10 px-4 py-3">
          <div className="flex items-center gap-3 text-sm text-black">
            <WarningCircle size={20} />
            <span className="font-semibold">Post as Scam Alert?</span>
          </div>
          <button
            type="button"
            onClick={toggleScam}
            className={`flex h-6 w-12 items-center rounded-full border border-black/10 px-1 transition ${
              isScam ? 'bg-black' : 'bg-black/10'
            }`}
          >
            <span
              className={`size-4 rounded-full bg-white transition ${
                isScam ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div>
            <p className="text-[16px] font-semibold text-black">Tags</p>
            <p className="text-sm text-black/60">
              add tags to help people find your post
            </p>
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(event) => onTagInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Create a tag"
              className="h-10 flex-1 rounded-[8px] border border-black/10 bg-black/5 px-4 text-[14px] text-black/80 placeholder:text-black/40 focus:border-black/40 focus:outline-none"
            />
            <Button
              onPress={handleAddTag}
              className="rounded-[8px] border border-black/15 px-4 text-sm font-semibold text-black"
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 rounded-[999px] bg-[#ebebeb] px-3 py-1 text-sm text-black"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-black/40"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            onPress={onPreview}
            className="rounded-[8px] border border-black/20 px-5 py-2 text-sm font-semibold text-black"
          >
            Preview Post
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button
              onPress={onDiscard}
              className="rounded-[8px] border border-black/20 px-5 py-2 text-sm font-semibold text-black"
            >
              Discard Draft
            </Button>
            <Button
              onPress={onPublish}
              isDisabled={isPublishDisabled}
              className={`rounded-[8px] px-6 py-2 text-sm font-semibold text-white ${
                isPublishDisabled ? 'bg-black/30' : 'bg-black'
              }`}
            >
              Publish Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
