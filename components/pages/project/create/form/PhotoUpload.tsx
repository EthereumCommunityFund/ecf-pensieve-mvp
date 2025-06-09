import { PhotoIcon } from '@heroicons/react/24/outline';
import { cn, Spinner } from '@heroui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { trpc } from '@/lib/trpc/client';

interface PhotoUploadProps {
  initialUrl?: string;
  onUploadSuccess?: (url: string) => void;
  accept?: string[];
  children?: React.ReactNode;
  className?: string;
  isDisabled?: boolean;
  maxSizeMB?: number;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  initialUrl,
  onUploadSuccess,
  accept = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  children,
  className = '',
  isDisabled = false,
  maxSizeMB = 10,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localUrl, setLocalUrl] = useState<string | undefined>(initialUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleClick = useCallback(() => {
    if (!isDisabled && !uploadMutation.isPending) {
      fileInputRef.current?.click();
    }
  }, [isDisabled, uploadMutation.isPending]);

  const resetInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const base64String = loadEvent.target?.result as string;
          if (base64String) {
            uploadMutation.mutate({ data: base64String, type: file.type });
          } else {
            setErrorMessage('Failed to read file.');
            console.error('FileReader onload result is null or not a string');
          }
        };
        reader.onerror = (error) => {
          setErrorMessage('Error reading file.');
          console.error('FileReader error:', error);
        };
        reader.readAsDataURL(file);
      }

      resetInput();
    },
    [accept, maxSizeMB, uploadMutation, resetInput],
  );

  const isLoading = uploadMutation.isPending;

  const avatarOverlay = isLoading ? (
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
        {avatarOverlay}
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
    </div>
  );
};

export default PhotoUpload;
