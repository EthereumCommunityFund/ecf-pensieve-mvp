import { Skeleton } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Input } from '@/components/base';
import { Button } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import PhotoUpload from '@/components/pages/project/create/PhotoUpload';
import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';

import { useProfileData } from './dataContext';

const profileFormSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  avatarUrl: z.string().url('Invalid URL format').or(z.literal('')).optional(),
});
type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function Setting() {
  const router = useRouter();
  const { address: profileAddressFromRoute } = useParams();
  const { profile: authProfile } = useAuth();
  const { user: viewedUserProfile, isLoading } = useProfileData();
  const { mutate: updateProfile, isPending } =
    trpc.user.updateProfile.useMutation();
  const utils = trpc.useUtils();

  const [isOwner, setIsOwner] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
    getValues,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    values: {
      displayName: viewedUserProfile?.name || '',
      avatarUrl: viewedUserProfile?.avatarUrl || '',
    },
  });

  useEffect(() => {
    if (!isLoading && !viewedUserProfile) {
      router.replace('/');
    }
  }, [isLoading, viewedUserProfile, router]);

  useEffect(() => {
    const currentAddr =
      typeof profileAddressFromRoute === 'string'
        ? profileAddressFromRoute.toLowerCase()
        : undefined;
    const authAddr = authProfile?.address?.toLowerCase();
    setIsOwner(!!currentAddr && !!authAddr && currentAddr === authAddr);
  }, [profileAddressFromRoute, authProfile]);

  const onSubmit = useCallback(() => {
    if (!isOwner) return;
    const formData = getValues();
    updateProfile(
      {
        name: formData.displayName,
        avatarUrl: formData.avatarUrl,
      },
      {
        onSuccess: () => {
          utils.user.getCurrentUser.invalidate();
        },
      },
    );
  }, [isOwner, getValues, updateProfile, utils]);

  const handleDiscard = useCallback(() => {
    if (!isOwner) return;
    reset({
      displayName: viewedUserProfile?.name || '',
      avatarUrl: viewedUserProfile?.avatarUrl || '',
    });
  }, [isOwner, reset, viewedUserProfile]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-10"
    >
      <div className="flex w-full flex-col gap-[5px]">
        <ECFTypography type="body1" className="font-semibold">
          Display Name
        </ECFTypography>
        <ECFTypography type="caption" className="opacity-80">
          This is publicly viewable displayed name
        </ECFTypography>
        {isLoading && !getValues('displayName') ? (
          <Skeleton className="h-[40px] w-full rounded-[8px]" />
        ) : (
          <>
            <Controller
              name="displayName"
              control={control}
              disabled={!isOwner || isSubmitting}
              render={({ field }) => (
                <Input
                  {...field}
                  className="size-full border-none bg-transparent opacity-60 disabled:opacity-50"
                  placeholder="Enter your display name"
                />
              )}
            />
            {errors.displayName && (
              <ECFTypography type="caption" className="mt-1 text-red-500">
                {errors.displayName.message}
              </ECFTypography>
            )}
          </>
        )}
      </div>

      <div className="flex w-full flex-col gap-[5px]">
        <ECFTypography type="body1" className="font-semibold">
          Avatar
        </ECFTypography>
        <ECFTypography type="caption" className="opacity-80">
          This is publicly viewable avatar
        </ECFTypography>
        {isLoading && !getValues('avatarUrl') ? (
          <Skeleton className="mt-[2px] size-[120px] rounded-full" />
        ) : (
          <>
            <Controller
              name="avatarUrl"
              control={control}
              disabled={!isOwner || isSubmitting}
              render={({ field }) => (
                <PhotoUpload
                  initialUrl={field.value || undefined}
                  onUploadSuccess={(url) => field.onChange(url || '')}
                  className="size-[120px] overflow-hidden rounded-full"
                  isDisabled={!isOwner || isSubmitting}
                >
                  <div
                    className={`flex size-[120px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#28C196] to-white ${
                      isOwner && !isSubmitting
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed opacity-50'
                    }`}
                  />
                </PhotoUpload>
              )}
            />
            {errors.avatarUrl && (
              <ECFTypography type="caption" className="mt-1 text-red-500">
                {errors.avatarUrl.message}
              </ECFTypography>
            )}
          </>
        )}
      </div>

      {isOwner && (
        <div className="flex h-[40px] w-full items-center justify-end gap-2 px-[10px]">
          <Button
            color="secondary"
            className="px-[20px] text-[14px] font-semibold"
            onPress={handleDiscard}
            disabled={!isDirty || isLoading || isSubmitting}
          >
            Discard
          </Button>
          <Button
            color="primary"
            type="submit"
            className="px-[30px] text-[14px] font-semibold"
            disabled={!isDirty || isLoading || isSubmitting}
            isLoading={isPending}
          >
            Save Changes
          </Button>
        </div>
      )}
    </form>
  );
}
