'use client';

import { ArrowLeft, WarningCircle } from '@phosphor-icons/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/base';
import MdEditor from '@/components/base/MdEditor';
import { addToast } from '@/components/base/toast';
import ProjectSearchSelector from '@/components/biz/FormAndTable/ProjectSearch/ProjectSearchSelector';
import { trpc } from '@/lib/trpc/client';
import { IProject } from '@/types';
import { IPocItemKey } from '@/types/item';

import { CategorySelector } from '../common/CategorySelector';
import { DiscourseTopicOption } from '../common/topicOptions';

import { PreviewPost } from './PreviewPost';

const MAX_TITLE = 40;
const MAX_BODY = 4000;
const PROJECT_SELECTOR_ITEM_KEY: IPocItemKey = 'name';

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

export type CreatePostErrors = {
  project?: string;
  title?: string;
  body?: string;
  category?: string;
  tags?: string;
};

type CreatePostFormProps = {
  title: string;
  body: string;
  bodyHtml: string;
  selectedCategory?: DiscourseTopicOption;
  tags: string[];
  tagInput: string;
  isScam: boolean;
  errors?: CreatePostErrors;
  projectName?: string;
  selectedProjectId?: string | number;
  projectError?: string;
  onProjectChange: (
    value: string | number | Array<string | number>,
    projectData?: IProject | IProject[],
  ) => void;
  onProjectClear?: () => void;
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

type ProjectOption = {
  id: number;
  name: string;
};

function CreatePostForm({
  title,
  body,
  bodyHtml,
  selectedCategory,
  tags,
  tagInput,
  isScam,
  errors,
  projectName,
  selectedProjectId,
  projectError,
  onProjectChange,
  onProjectClear,
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
}: CreatePostFormProps) {
  const remainingTitle = MAX_TITLE - title.length;
  const remainingBody = useMemo(
    () => MAX_BODY - stripHtml(bodyHtml).length,
    [bodyHtml],
  );
  const hasSelectedProject =
    selectedProjectId !== undefined && selectedProjectId !== null;

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
        <span>{projectName || 'Project'}</span>
        <span>/</span>
        <span>Discussions</span>
        <span>/</span>
        <span className="font-semibold text-black">Create Post</span>
      </div>

      <div className="tablet:max-a-auto mobile:max-w-auto flex w-full max-w-[700px] flex-col gap-8 rounded-[20px] px-10 py-8">
        <div className="rounded-[12px] ">
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-black">
              Select a project
            </p>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex h-[40px] items-center rounded-[10px] border border-black/10">
              <ProjectSearchSelector
                value={selectedProjectId}
                onChange={onProjectChange}
                placeholder="Search project name"
                multiple={false}
                allowNA={false}
                columnName="Project"
                searchModalTitle="Select project"
                itemKey={PROJECT_SELECTOR_ITEM_KEY}
                error={projectError}
              />
            </div>
            {hasSelectedProject ? (
              <button
                type="button"
                onClick={() => onProjectClear?.()}
                className="text-xs font-semibold text-black/60 hover:text-black"
              >
                Clear selection
              </button>
            ) : (
              <p className="text-right text-xs text-black/60">
                Choose a published project to anchor this thread.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[16px] font-semibold text-black">Title</label>
          <input
            value={title}
            onChange={(event) =>
              onTitleChange(event.target.value.slice(0, MAX_TITLE))
            }
            placeholder="Type a title for your thread"
            className={`h-10 rounded-[8px] border bg-black/5 px-4 text-[14px] text-black/80 placeholder:text-black/40 focus:outline-none ${
              errors?.title
                ? 'border-[#d14343] focus:border-[#d14343]'
                : 'border-black/10 focus:border-black/40'
            }`}
          />
          {errors?.title ? (
            <p className="text-xs text-[#d14343]">{errors.title}</p>
          ) : null}
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
              base: `min-h-[280px] rounded-[12px] border bg-black/5 ${
                errors?.body ? 'border-[#d14343]' : 'border-black/10'
              }`,
              editorWrapper: 'p-0',
              editor: 'prose prose-sm max-w-none text-[#1b1b1f]',
            }}
          />
          {errors?.body ? (
            <p className="text-xs text-[#d14343]">{errors.body}</p>
          ) : null}
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
          error={errors?.category}
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
              className={`h-10 flex-1 rounded-[8px] border bg-black/5 px-4 text-[14px] text-black/80 placeholder:text-black/40 focus:outline-none ${
                errors?.tags
                  ? 'border-[#d14343] focus:border-[#d14343]'
                  : 'border-black/10 focus:border-black/40'
              }`}
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
          {errors?.tags ? (
            <p className="text-xs text-[#d14343]">{errors.tags}</p>
          ) : null}
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
                isPublishDisabled ? 'bg-black/30' : 'bg-black hover:bg-black/80'
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

export function CreatePost() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(
    null,
  );
  const presetProjectIdParam = searchParams?.get('projectId');
  const presetProjectId = presetProjectIdParam
    ? Number(presetProjectIdParam)
    : undefined;
  const shouldLoadPresetProject =
    typeof presetProjectId === 'number' && Number.isFinite(presetProjectId);
  const utils = trpc.useUtils();

  const { data: presetProjectData } = trpc.project.getProjectById.useQuery(
    { id: presetProjectId as number },
    { enabled: shouldLoadPresetProject },
  );

  const createThreadMutation =
    trpc.projectDiscussionThread.createThread.useMutation({
      onSuccess: (thread) => {
        addToast({ title: 'Thread published', color: 'success' });
        utils.projectDiscussionThread.listThreads.invalidate();
        setShowPreview(false);
        router.push(`/discourse/${thread.id}`);
      },
      onError: (error) => {
        addToast({
          title: 'Failed to publish thread',
          description: error.message,
          color: 'danger',
        });
      },
    });

  useEffect(() => {
    if (!presetProjectData) return;
    setSelectedProject((current) => {
      if (current?.id === presetProjectData.id) {
        return current;
      }
      return {
        id: presetProjectData.id,
        name:
          presetProjectData.projectSnap?.name ??
          presetProjectData.name ??
          `Project #${presetProjectData.id}`,
      };
    });
  }, [presetProjectData]);

  const bodyHtml = useMemo(() => parseEditorHtml(body), [body]);
  const plainBody = useMemo(() => stripHtml(bodyHtml), [bodyHtml]);
  const isPublishDisabled =
    !title.trim() ||
    !plainBody ||
    !selectedCategory ||
    !tags.length ||
    !selectedProject ||
    createThreadMutation.isPending;

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

  const handleProjectSelectorChange = (
    value: string | number | Array<string | number>,
    projectData?: IProject | IProject[],
  ) => {
    clearError('project');
    if (Array.isArray(projectData)) {
      return;
    }
    if (projectData) {
      setSelectedProject({
        id: projectData.id,
        name:
          projectData.projectSnap?.name ??
          projectData.name ??
          `Project #${projectData.id}`,
      });
      return;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const numericId = Number(value);
      if (!Number.isNaN(numericId)) {
        setSelectedProject({
          id: numericId,
          name: `Project #${numericId}`,
        });
      }
    }
  };

  const handleClearProject = () => {
    setSelectedProject(null);
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
    if (!selectedProject) {
      newErrors.project = 'Project is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    if (!validateForm()) return;
    setShowPreview(true);
  };

  const handlePublish = async () => {
    if (!validateForm()) return;
    if (!selectedProject || !selectedCategory) return;

    try {
      await createThreadMutation.mutateAsync({
        projectId: selectedProject.id,
        title: title.trim(),
        post: bodyHtml,
        category: [selectedCategory.value],
        tags,
        isScam,
      });
    } catch (error) {
      console.error('Failed to publish thread', error);
    }
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
          <CreatePostForm
            title={title}
            body={body}
            bodyHtml={bodyHtml}
            selectedCategory={selectedCategory}
            tags={tags}
            tagInput={tagInput}
            isScam={isScam}
            errors={errors}
            projectName={selectedProject?.name}
            selectedProjectId={selectedProject?.id}
            projectError={errors.project}
            onProjectChange={handleProjectSelectorChange}
            onProjectClear={handleClearProject}
            onTitleChange={handleTitleChange}
            onBodyChange={handleBodyChange}
            onCategoryChange={handleCategoryChange}
            onTagsChange={handleTagsChange}
            onTagInputChange={(value) => setTagInput(value)}
            onIsScamChange={(value) => setIsScam(value)}
            onPreview={handlePreview}
            onPublish={handlePublish}
            onBack={() => router.back()}
            onDiscard={() => {
              setTitle('');
              setBody('');
              setTags([]);
              setTagInput('');
              setErrors({});
              setSelectedCategory(undefined);
              setSelectedProject(null);
            }}
            isPublishDisabled={isPublishDisabled}
          />
        )}
      </div>
    </div>
  );
}
