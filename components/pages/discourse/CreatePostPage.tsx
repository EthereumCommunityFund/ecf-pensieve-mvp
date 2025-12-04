'use client';

import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import { Button } from '@/components/base';

import { CreatePost, type CreatePostErrors } from './CreatePost';
import { PreviewPost } from './PreviewPost';
import { DiscourseTopicOption } from './topicOptions';

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
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isScam, setIsScam] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<CreatePostErrors>({});

  const bodyHtml = useMemo(() => parseEditorHtml(body), [body]);
  const plainBody = useMemo(() => stripHtml(bodyHtml), [bodyHtml]);
  const isPublishDisabled =
    !title.trim() || !plainBody || !selectedCategory || !tags.length;

  const clearError = (field: keyof CreatePostErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleTitleChange = (value: string) => {
    clearError('title');
    setTitle(value);
  };

  const handleBodyChange = (value: string) => {
    clearError('body');
    setBody(value);
  };

  const handleCategoryChange = (category?: DiscourseTopicOption) => {
    clearError('category');
    setSelectedCategory(category);
  };

  const handleTagsChange: Dispatch<SetStateAction<string[]>> = (updater) => {
    setTags((prev) => {
      const next =
        typeof updater === 'function'
          ? (updater as (current: string[]) => string[])(prev)
          : updater;
      if (next.length) {
        clearError('tags');
      }
      return next;
    });
  };

  const validateForm = () => {
    const newErrors: CreatePostErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!plainBody) {
      newErrors.body = 'Post content is required';
    }
    if (!selectedCategory) {
      newErrors.category = 'Category is required';
    }
    if (!tags.length) {
      newErrors.tags = 'At least one tag is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    if (!validateForm()) return;
    setShowPreview(true);
  };

  const handlePublish = () => {
    if (!validateForm()) return;
    // TODO: integrate publish flow
  };

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 pb-16 pt-[10px]">
        {showPreview ? (
          <PreviewPost
            onBack={() => setShowPreview(false)}
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
                  onPress={handlePublish}
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
          <CreatePost
            title={title}
            body={body}
            bodyHtml={bodyHtml}
            selectedCategory={selectedCategory}
            tags={tags}
            tagInput={tagInput}
            isScam={isScam}
            errors={errors}
            onTitleChange={handleTitleChange}
            onBodyChange={handleBodyChange}
            onCategoryChange={handleCategoryChange}
            onTagsChange={handleTagsChange}
            onTagInputChange={(value) => setTagInput(value)}
            onIsScamChange={(value) => setIsScam(value)}
            onPreview={handlePreview}
            onPublish={handlePublish}
            onBack={() => router.back()}
            isPublishDisabled={isPublishDisabled}
          />
        )}
      </div>
    </div>
  );
}
