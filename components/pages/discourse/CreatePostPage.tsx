'use client';

import { ArrowLeft, WarningCircle } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button } from '@/components/base';
import MdEditor from '@/components/base/MdEditor';

import { CategorySelector } from './CategorySelector';
import { PreviewPost } from './PreviewPost';
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

const parseEditorHtml = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed.content === 'string') {
      return parsed.content;
    }
  } catch (error) {
    return value;
  }
  return '';
};

export function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    DiscourseTopicOption | undefined
  >();
  const [tags, setTags] = useState<string[]>(['EIP']);
  const [tagInput, setTagInput] = useState('');
  const [isScam, setIsScam] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const bodyHtml = useMemo(() => parseEditorHtml(body), [body]);
  const remainingTitle = MAX_TITLE - title.length;
  const remainingBody = MAX_BODY - stripHtml(bodyHtml).length;

  const isPublishDisabled =
    !title.trim() || !bodyHtml.trim() || !selectedCategory;

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    setTags((prev) => Array.from(new Set([...prev, tagInput.trim()])));
    setTagInput('');
  };

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 pb-16 pt-[10px]">
        {showPreview ? (
          <PreviewPost
            onBack={() => setShowPreview(false)}
            backLabel="Edit Post"
            headerLabel="Preview"
            title={title || 'Untitled Post'}
            author="Username"
            timeAgo="Just now"
            contentHtml={bodyHtml}
            tags={tags}
            categoryLabel={selectedCategory?.label || 'General Issue'}
            actions={
              <>
                <Button
                  onPress={() => setShowPreview(false)}
                  className="rounded-[8px] border border-black/15 px-6 py-2 text-sm font-semibold text-black"
                >
                  Back to Edit
                </Button>
                <Button
                  isDisabled={isPublishDisabled}
                  className={`rounded-[8px] px-6 py-2 text-sm font-semibold text-white ${
                    isPublishDisabled ? 'bg-black/30' : 'bg-black'
                  }`}
                >
                  Publish Post
                </Button>
              </>
            }
          />
        ) : (
          <div className="flex flex-col gap-[20px]">
            <div className="flex flex-wrap items-center gap-3 text-[14px] text-black/60">
              <Button
                onPress={() => router.back()}
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

            <div className="flex flex-col gap-8 rounded-[20px] px-10 py-8">
              <div className="flex flex-col gap-1">
                <label className="text-[16px] font-semibold text-black">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value.slice(0, MAX_TITLE))
                  }
                  placeholder="Type a title for your thread"
                  className="h-10 rounded-[8px] border border-black/10 bg-black/5 px-4 text-[14px] text-black/80 placeholder:text-black/40 focus:border-black/40 focus:outline-none"
                />
                <p className="text-right text-xs text-black/60">
                  {remainingTitle} characters remaining
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[16px] font-semibold text-black">
                  Post
                </label>
                <MdEditor
                  value={body}
                  onChange={(value) => setBody(value)}
                  debounceMs={500}
                  className={{
                    base: 'min-h-[280px] rounded-[12px] border border-black/10 bg-black/5',
                    editorWrapper: 'p-4',
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
                onChange={(category) => setSelectedCategory(category)}
              />

              <div className="flex items-center justify-between rounded-[8px] border border-black/10 px-4 py-3">
                <div className="flex items-center gap-3 text-sm text-black">
                  <WarningCircle size={20} />
                  <span className="font-semibold">Post as Scam Alert?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScam((prev) => !prev)}
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
                    onChange={(event) => setTagInput(event.target.value)}
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
                        onClick={() =>
                          setTags((prev) => prev.filter((item) => item !== tag))
                        }
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
                  onPress={() => setShowPreview(true)}
                  className="rounded-[8px] border border-black/20 px-5 py-2 text-sm font-semibold text-black"
                >
                  Preview Post
                </Button>
                <div className="flex flex-wrap gap-3">
                  <Button className="rounded-[8px] border border-black/20 px-5 py-2 text-sm font-semibold text-black">
                    Discard Draft
                  </Button>
                  <Button
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
        )}
      </div>
    </div>
  );
}
