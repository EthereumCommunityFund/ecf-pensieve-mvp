import { PhotoIcon } from '@heroicons/react/24/outline';
import { cn, Spinner } from '@heroui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useUpload } from '@/hooks/useUpload';

interface AvatarUploadProps {
  initialUrl?: string;
  onUploadSuccess?: (url: string) => void;
  accept?: string[];
  api?: string;
  children?: React.ReactNode;
  className?: string;
  isDisabled?: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  initialUrl,
  onUploadSuccess,
  accept = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
  api = '/api/file/upload',
  children,
  className = '',
  isDisabled = false,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localUrl, setLocalUrl] = useState<string | undefined>(initialUrl);

  const { url, isLoading, errorMessage, handleUpload } = useUpload({
    api,
    onSuccess: (uploadedUrl) => {
      onUploadSuccess?.(uploadedUrl);
    },
  });

  // 合并两个 useEffect 为一个，优化状态更新逻辑
  useEffect(() => {
    if (!isLoading) {
      if (url) {
        setLocalUrl(url);
      } else if (initialUrl !== localUrl) {
        setLocalUrl(initialUrl);
      }
    }
  }, [isLoading, url, initialUrl]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          await handleUpload(file);
        } catch (error) {
          console.error('文件上传失败:', error);
        }
      }
      // 重置 input 以便同一文件可以再次上传
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleUpload],
  );

  const avatarOverlay = isLoading ? (
    <div className="absolute inset-0 flex items-center justify-center bg-opacity-40">
      <Spinner size="sm" color="white" />
    </div>
  ) : (
    isHovering &&
    localUrl && (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black  bg-opacity-40 transition-opacity duration-200">
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
        className="group relative w-full cursor-pointer"
        onClick={!isDisabled ? handleClick : undefined}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {children}
        {!isDisabled && avatarOverlay}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept.join(',')}
        onChange={handleFileChange}
        disabled={isDisabled}
      />

      {errorMessage && (
        <div className="mt-2 text-center text-sm text-red-500">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
