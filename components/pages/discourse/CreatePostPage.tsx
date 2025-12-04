'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Button } from '@/components/base';
import { addToast } from '@/components/base/toast';
import { trpc } from '@/lib/trpc/client';

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

type ProjectOption = {
  id: number;
  name: string;
};

export function CreatePostPage() {
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
  const [projectSearch, setProjectSearch] = useState('');
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

  const [debouncedProjectSearch] = useDebounce(projectSearch, 300);
  const normalizedProjectSearch = debouncedProjectSearch.trim();
  const shouldSearchProjects = normalizedProjectSearch.length >= 2;
  const { data: projectSearchData, isFetching: isSearchingProjects } =
    trpc.project.searchProjects.useQuery(
      {
        query: normalizedProjectSearch,
        limit: 5,
      },
      {
        enabled: shouldSearchProjects,
      },
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

  const projectResults = useMemo<ProjectOption[]>(() => {
    if (!projectSearchData?.published.items.length) {
      return [];
    }
    return projectSearchData.published.items.map((item) => ({
      id: item.id,
      name: item.projectSnap?.name ?? item.name ?? `Project #${item.id}`,
    }));
  }, [projectSearchData]);

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

  const handleSelectProject = (option: ProjectOption) => {
    clearError('project');
    setSelectedProject(option);
    setProjectSearch('');
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

  const projectSelector = (
    <div className="space-y-2">
      {selectedProject ? (
        <div className="flex items-center justify-between rounded-[8px] border border-black/15 bg-white px-4 py-2 text-sm text-black">
          <span>
            {selectedProject.name} (#{selectedProject.id})
          </span>
          <button
            type="button"
            onClick={handleClearProject}
            className="text-xs font-semibold text-black/60 hover:text-black"
          >
            Clear
          </button>
        </div>
      ) : (
        <p className="text-sm text-black/60">
          Choose a published project to anchor this thread.
        </p>
      )}
      <input
        value={projectSearch}
        onChange={(event) => setProjectSearch(event.target.value)}
        placeholder="Search project name"
        className="w-full rounded-[8px] border border-black/10 bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus:border-black/40 focus:outline-none"
      />
      {projectSearch.length > 0 && projectSearch.length < 2 ? (
        <p className="text-xs text-black/40">
          Type at least 2 characters to search.
        </p>
      ) : null}
      {shouldSearchProjects ? (
        <div className="rounded-[8px] border border-black/10 bg-white">
          {isSearchingProjects ? (
            <p className="p-3 text-sm text-black/60">Searching…</p>
          ) : projectResults.length ? (
            <ul className="divide-y divide-black/10">
              {projectResults.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectProject(option)}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-semibold text-black hover:bg-black/5"
                  >
                    <span>{option.name}</span>
                    <span className="text-xs text-black/50">#{option.id}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-3 text-sm text-black/60">No projects found.</p>
          )}
        </div>
      ) : null}
    </div>
  );

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
            projectName={selectedProject?.name}
            projectSelector={projectSelector}
            projectError={errors.project}
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
