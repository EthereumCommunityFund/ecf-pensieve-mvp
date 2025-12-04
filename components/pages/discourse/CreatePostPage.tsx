'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button } from '@/components/base';

import { CreatePost } from './CreatePost';
import { PreviewPost } from './PreviewPost';
import { DiscourseTopicOption } from './topicOptions';

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
  const isPublishDisabled =
    !title.trim() || !bodyHtml.trim() || !selectedCategory;

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
            onTitleChange={(value) => setTitle(value)}
            onBodyChange={(value) => setBody(value)}
            onCategoryChange={(category) => setSelectedCategory(category)}
            onTagsChange={setTags}
            onTagInputChange={(value) => setTagInput(value)}
            onIsScamChange={(value) => setIsScam(value)}
            onPreview={() => setShowPreview(true)}
            onPublish={() => {}}
            onBack={() => router.back()}
            isPublishDisabled={isPublishDisabled}
          />
        )}
      </div>
    </div>
  );
}
