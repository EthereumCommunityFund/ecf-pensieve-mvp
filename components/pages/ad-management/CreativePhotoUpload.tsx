import { PhotoIcon } from '@heroicons/react/24/outline';
import { cn, Spinner } from '@heroui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { trpc } from '@/lib/trpc/client';

import { CreativeImageCropper } from './CreativeImageCropper';

interface CreativePhotoUploadProps {
  initialUrl?: string;
  onUploadSuccess?: (url: string) => void;
  accept?: string[];
  children?: React.ReactNode;
  className?: string;
  isDisabled?: boolean;
  maxSizeMB?: number;
  enableCrop?: boolean;
  cropAspectRatio?: number;
  cropMaxWidth?: number;
  cropMaxHeight?: number;
  cropQuality?: number;
}

export const CreativePhotoUpload: React.FC<CreativePhotoUploadProps> = ({
  initialUrl,
  onUploadSuccess,
  accept = ['image/jpeg', 'image/png', 'image/gif'],
  children,
  className = '',
  isDisabled = false,
  maxSizeMB = 10,
  enableCrop = true,
  cropAspectRatio = 1,
  cropMaxWidth,
  cropMaxHeight,
  cropQuality,
}) => {
  const { profile, showAuthPrompt } = useAuth();
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localUrl, setLocalUrl] = useState<string | undefined>(initialUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const uploadMutation = trpc.file.uploadFile.useMutation({
    onSuccess: (data) => {
      setLocalUrl(data.url);
      onUploadSuccess?.(data.url);
      setErrorMessage(null);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      setErrorMessage(error.message || 'Upload failed. Please try again.');
    },
  });

  useEffect(() => {
    if (!uploadMutation.isPending && initialUrl !== localUrl) {
      setLocalUrl(initialUrl);
    }
  }, [initialUrl, uploadMutation.isPending, localUrl]);

  const resetInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClick = useCallback(() => {
    if (isDisabled || uploadMutation.isPending) {
      return;
    }

    if (!profile?.userId) {
      showAuthPrompt();
      resetInput();
      return;
    }

    fileInputRef.current?.click();
  }, [
    isDisabled,
    uploadMutation.isPending,
    profile?.userId,
    showAuthPrompt,
    resetInput,
  ]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!profile?.userId) {
        showAuthPrompt();
        resetInput();
        return;
      }

      setErrorMessage(null);
      const file = e.target.files?.[0];

      if (file) {
        if (!accept.includes(file.type)) {
          setErrorMessage(`Invalid file type. Accepted: ${accept.join(', ')}`);
          resetInput();
          return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
          setErrorMessage(`File exceeds ${maxSizeMB}MB limit.`);
          resetInput();
          return;
        }

        if (enableCrop) {
          setOriginalFile(file);
          const tempUrl = URL.createObjectURL(file);
          setTempImageUrl(tempUrl);
          setIsCropperOpen(true);
          resetInput();
        } else {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            const base64String = loadEvent.target?.result as string;
            if (base64String) {
              uploadMutation.mutate({
                data: base64String,
                type: file.type,
              });
            } else {
              setErrorMessage('Failed to process image.');
            }
            resetInput();
          };
          reader.onerror = () => {
            setErrorMessage('Error processing image.');
            resetInput();
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [
      accept,
      enableCrop,
      maxSizeMB,
      profile?.userId,
      resetInput,
      showAuthPrompt,
      uploadMutation,
    ],
  );

  const handleCropComplete = useCallback(
    async (croppedImageUrl: string) => {
      if (!originalFile) return;

      try {
        const response = await fetch(croppedImageUrl);
        const blob = await response.blob();

        if (blob.size > maxSizeMB * 1024 * 1024) {
          setErrorMessage(`Cropped image still exceeds ${maxSizeMB}MB limit.`);
          URL.revokeObjectURL(croppedImageUrl);
          return;
        }

        const reader = new FileReader();

        reader.onload = (loadEvent) => {
          const base64String = loadEvent.target?.result as string;
          if (base64String) {
            uploadMutation.mutate({
              data: base64String,
              type: blob.type,
            });
          } else {
            setErrorMessage('Failed to process cropped image.');
          }
        };

        reader.onerror = () => {
          setErrorMessage('Error processing cropped image.');
        };

        reader.readAsDataURL(blob);

        URL.revokeObjectURL(croppedImageUrl);
        if (tempImageUrl) {
          URL.revokeObjectURL(tempImageUrl);
          setTempImageUrl(null);
        }
      } catch (error) {
        console.error('Error processing cropped image:', error);
        setErrorMessage('Failed to process cropped image.');
      }
    },
    [maxSizeMB, originalFile, tempImageUrl, uploadMutation],
  );

  const handleCropperClose = useCallback(() => {
    setIsCropperOpen(false);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
    setOriginalFile(null);
  }, [tempImageUrl]);

  useEffect(() => {
    return () => {
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }
    };
  }, [tempImageUrl]);

  const isLoading = uploadMutation.isPending;

  const overlay = isLoading ? (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <Spinner size="sm" color="white" />
    </div>
  ) : (
    isHovering &&
    localUrl &&
    !isDisabled && (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 transition-opacity duration-200">
        <PhotoIcon className="size-6 text-white opacity-50" />
      </div>
    )
  );

  return (
    <div
      className={cn(
        'relative inline-flex flex-col items-center overflow-hidden',
        className,
      )}
    >
      <div
        className={cn(
          'group relative w-full',
          !isDisabled && !isLoading ? 'cursor-pointer' : 'cursor-default',
        )}
        onClick={handleClick}
        onMouseEnter={() => !isDisabled && !isLoading && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {children}
        {overlay}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept.join(',')}
        onChange={handleFileChange}
        disabled={isDisabled || isLoading}
      />

      {errorMessage && (
        <div className="mt-2 w-full text-center text-sm text-red-500">
          {errorMessage}
        </div>
      )}

      {tempImageUrl && enableCrop && (
        <CreativeImageCropper
          src={tempImageUrl}
          isOpen={isCropperOpen}
          onClose={handleCropperClose}
          onCropComplete={handleCropComplete}
          aspectRatio={cropAspectRatio}
          maxWidth={cropMaxWidth}
          maxHeight={cropMaxHeight}
          quality={cropQuality}
          maxSizeMB={maxSizeMB}
          outputType={
            originalFile?.type === 'image/png'
              ? 'image/png'
              : originalFile?.type === 'image/webp'
                ? 'image/webp'
                : 'image/jpeg'
          }
          onError={setErrorMessage}
        />
      )}
    </div>
  );
};

export default CreativePhotoUpload;
