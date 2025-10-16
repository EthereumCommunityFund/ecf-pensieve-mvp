'use client';

import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useAdminAccess } from '@/components/admin/AdminAccessContext';
import { Button } from '@/components/base/button';
import { Input, Textarea } from '@/components/base/input';
import { Select, SelectItem } from '@/components/base/select';
import { addToast } from '@/components/base/toast';
import { NotificationPreview } from '@/components/notification/NotificationPreview';
import type { BroadcastNotificationType } from '@/lib/services/notification';
import type { RouterInputs } from '@/lib/trpc/client';
import { trpc } from '@/lib/trpc/client';

type BroadcastNotificationInput =
  RouterInputs['notification']['broadcastNotification'];

type FormValues = {
  type: BroadcastNotificationType;
  title: string;
  body: string;
  callToActionLabel: string;
  callToActionUrl: string;
  extra: string;
};

const defaultValues: FormValues = {
  type: 'systemUpdate',
  title: '',
  body: '',
  callToActionLabel: '',
  callToActionUrl: '',
  extra: '',
};

const parseExtra = (value: string) => {
  if (!value.trim()) {
    return { data: undefined, error: null as string | null };
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { data: parsed as Record<string, unknown>, error: null };
    }
    return {
      data: undefined,
      error: 'Extra must be a JSON object, e.g. {"key":"value"}.',
    };
  } catch (error) {
    return {
      data: undefined,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to parse extra field. Ensure it is valid JSON.',
    };
  }
};

const sanitizeOptionalNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
};

export const BroadcastNotificationPage = () => {
  const adminAccess = useAdminAccess();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    mode: 'onBlur',
  });

  const watchType = watch('type');
  const watchTitle = watch('title');
  const watchBody = watch('body');
  const watchCtaLabel = watch('callToActionLabel');
  const watchCtaUrl = watch('callToActionUrl');
  const watchExtra = watch('extra');

  const extraParseResult = useMemo(() => parseExtra(watchExtra), [watchExtra]);

  const trimmedPreviewLabel = watchCtaLabel.trim();
  const trimmedPreviewUrl = watchCtaUrl.trim();
  const hasPreviewCta = Boolean(trimmedPreviewLabel && trimmedPreviewUrl);
  const previewButtonLabel = hasPreviewCta ? trimmedPreviewLabel : '';
  const previewTargetUrl = hasPreviewCta ? trimmedPreviewUrl : undefined;

  const previewData = useMemo(
    () => ({
      type: watchType,
      title: watchTitle || undefined,
      description: watchBody || undefined,
      buttonText: previewButtonLabel,
      hideButton: !previewButtonLabel,
      ctaLabel: hasPreviewCta ? (watchCtaLabel ?? undefined) : undefined,
      ctaUrl: hasPreviewCta ? (watchCtaUrl ?? undefined) : undefined,
      targetUrl: previewTargetUrl,
      metadata: {
        title: watchTitle || undefined,
        body: watchBody || undefined,
        ctaLabel: hasPreviewCta ? (watchCtaLabel ?? undefined) : undefined,
        ctaUrl: hasPreviewCta ? (watchCtaUrl ?? undefined) : undefined,
        extra: extraParseResult.data,
      },
      metadataTitle: watchTitle || undefined,
      metadataBody: watchBody || undefined,
      metadataExtra: extraParseResult.data,
    }),
    [
      extraParseResult.data,
      previewButtonLabel,
      previewTargetUrl,
      watchBody,
      watchCtaLabel,
      watchCtaUrl,
      watchTitle,
      watchType,
    ],
  );

  const broadcastMutation = trpc.notification.broadcastNotification.useMutation(
    {
      onSuccess: () => {
        addToast({
          color: 'success',
          title: 'Broadcast notification queued',
          description:
            'The notification has been enqueued and will be delivered by the cron worker.',
        });
        reset(defaultValues);
      },
      onError: (error) => {
        addToast({
          color: 'danger',
          title: 'Failed to send broadcast',
          description:
            error.message ?? 'Retry later or contact the engineering team.',
        });
      },
    },
  );

  const onSubmit = async (values: FormValues) => {
    if (extraParseResult.error) {
      setError('extra', {
        type: 'manual',
        message: extraParseResult.error,
      });
      return;
    }

    clearErrors('extra');

    const trimmedLabel = values.callToActionLabel.trim();
    const trimmedUrl = values.callToActionUrl.trim();
    const payload: BroadcastNotificationInput = {
      type: values.type,
      title: values.title.trim(),
      body: values.body.trim(),
      callToActionLabel: trimmedLabel && trimmedUrl ? trimmedLabel : undefined,
      callToActionUrl: trimmedUrl || undefined,
      extra: extraParseResult.data,
    };

    try {
      await broadcastMutation.mutateAsync(payload);
    } catch {
      // Mutation handles its own errors
    }
  };

  const isSubmitting = broadcastMutation.isPending;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 lg:flex-row">
      <div className="flex-1 space-y-6">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-2">
            <h1 className="text-[24px] font-semibold leading-[32px] text-black">
              Broadcast a notification
            </h1>
            <p className="text-[14px] leading-[22px] text-black/70">
              Configure the title, body, and optional CTA below. Submitted
              notifications are enqueued and delivered by the background worker.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 rounded-[14px] bg-black/[0.03] p-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-medium uppercase tracking-wide text-black/60">
                Admin wallet
              </span>
              <span className="text-[14px] font-semibold text-black">
                {adminAccess.normalizedAddress ?? 'N/A'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-medium uppercase tracking-wide text-black/60">
                Role & source
              </span>
              <span className="text-[14px] font-semibold text-black">
                {adminAccess.role ?? 'Unknown'} · {adminAccess.source ?? 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <form
          className="space-y-6 rounded-2xl border border-black/10 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <section className="space-y-4">
            <h2 className="text-[18px] font-semibold leading-[24px] text-black">
              Notification content (required)
            </h2>

            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  selectedKeys={
                    field.value ? new Set<React.Key>([field.value]) : new Set()
                  }
                  selectionMode="single"
                  onSelectionChange={(selected) => {
                    if (selected === 'all') {
                      field.onChange('systemUpdate');
                      return;
                    }

                    const firstKey = Array.from(selected)[0];
                    field.onChange(
                      (firstKey as BroadcastNotificationType) ?? 'systemUpdate',
                    );
                  }}
                  classNames={{
                    base: 'max-w-full',
                    trigger: 'h-[42px]',
                  }}
                >
                  <SelectItem key="systemUpdate">System Update</SelectItem>
                  <SelectItem key="newItemsAvailable">
                    New Items Available
                  </SelectItem>
                </Select>
              )}
            />

            <Controller
              control={control}
              name="title"
              rules={{
                required: 'Title is required.',
                maxLength: {
                  value: 200,
                  message: 'Title cannot exceed 200 characters.',
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter notification title"
                  errorMessage={errors.title?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="body"
              rules={{
                required: 'Body is required.',
                maxLength: {
                  value: 5000,
                  message: 'Body cannot exceed 5000 characters.',
                },
              }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Enter notification body"
                  errorMessage={errors.body?.message}
                />
              )}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-[18px] font-semibold leading-[24px] text-black">
              CTA (optional)
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="callToActionLabel"
                rules={{
                  maxLength: {
                    value: 80,
                    message: 'CTA label cannot exceed 80 characters.',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Button label"
                    errorMessage={errors.callToActionLabel?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="callToActionUrl"
                rules={{
                  validate: (value) => {
                    const trimmed = value.trim();
                    if (!trimmed) return true;
                    if (
                      /^https?:\/\//i.test(trimmed) ||
                      trimmed.startsWith('/')
                    ) {
                      return true;
                    }
                    return 'URL must start with http(s):// or /.';
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Button URL"
                    errorMessage={errors.callToActionUrl?.message}
                  />
                )}
              />
            </div>
          </section>

          {/* <section className="space-y-4">
            <h2 className="text-[18px] font-semibold leading-[24px] text-black">
              Extra payload (optional)
            </h2>
            <Controller
              control={control}
              name="extra"
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder='{"icon":"megaphone","lang":"en"}'
                  errorMessage={
                    errors.extra?.message ?? extraParseResult.error ?? undefined
                  }
                />
              )}
            />
            <p className="text-[12px] leading-[18px] text-black/50">
              Use this to pass additional metadata such as icons or
              localization. The value must be valid JSON.
            </p>
          </section> */}

          <div className="flex flex-wrap items-center gap-4">
            <Button
              color="primary"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={isSubmitting || Boolean(extraParseResult.error)}
            >
              {isSubmitting ? 'Submitting...' : 'Send broadcast'}
            </Button>
            <Button
              size="md"
              type="button"
              onPress={() => reset(defaultValues)}
              isDisabled={isSubmitting}
            >
              Reset form
            </Button>
          </div>
        </form>
      </div>

      <aside className="w-full max-w-[420px] shrink-0 space-y-6">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
          <h2 className="text-[18px] font-semibold leading-[24px] text-black">
            Live preview
          </h2>
          <p className="mb-4 text-[13px] leading-[18px] text-black/60">
            This preview reuses the in-app notification card to show the final
            rendering.
          </p>
          <div className="overflow-hidden rounded-[14px] border border-black/5 bg-black/[0.02]">
            <NotificationPreview data={previewData} />
          </div>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_8px_20px_rgba(0,0,0,0.05)]">
          <h3 className="text-[16px] font-semibold leading-[22px] text-black">
            Tips
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-[13px] leading-[18px] text-black/70">
            <li>
              Title and body are required. CTA and navigation fields are
              optional.
            </li>
            <li>
              If you only provide links, the button text defaults to “View
              Details”.
            </li>
            <li>
              Extra must be a JSON object for custom metadata such as icons or
              localization.
            </li>
            <li>
              Notifications are delivered after the cron worker runs. Allow time
              for propagation.
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
};
