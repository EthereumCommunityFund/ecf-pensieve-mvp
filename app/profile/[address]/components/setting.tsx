import { useState } from 'react';

import { Input } from '@/components/base';
import { ECFButton } from '@/components/base/button';
import ECFTypography from '@/components/base/typography';
import PhotoUpload from '@/components/pages/project/create/PhotoUpload';

export default function Setting() {
  const [displayName, setDisplayName] = useState('drivenfast');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const handleSaveChanges = () => {
    // Save profile changes logic here
  };

  const handleDiscard = () => {
    // Discard changes logic here
  };

  return (
    <div className="flex w-full flex-col gap-10">
      {/* Display Name Input */}
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col gap-1">
          <ECFTypography type="h4" className="font-semibold">
            Display Name
          </ECFTypography>
          <ECFTypography type="body2" className="opacity-80">
            This is your publicly viewable displayed name
          </ECFTypography>
        </div>
        <div className="h-[40px] w-full rounded-lg border border-[rgba(0,0,0,0.1)] bg-[rgba(0,0,0,0.05)] p-[0px_10px]">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="size-full border-none bg-transparent opacity-60"
            placeholder="Enter your display name"
          />
        </div>
      </div>

      {/* Avatar Upload */}
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col gap-1">
          <ECFTypography type="h4" className="font-semibold">
            Avatar
          </ECFTypography>
          <ECFTypography type="body2" className="opacity-80">
            This is your publicly viewable avatar
          </ECFTypography>
          <div className="mt-4">
            <PhotoUpload
              initialUrl={avatarUrl}
              onUploadSuccess={setAvatarUrl}
              className="size-[120px] overflow-hidden rounded-full"
            >
              <div className="flex size-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#28C196] to-white">
                {!avatarUrl && (
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12.75C8.83 12.75 6.25 10.17 6.25 7C6.25 3.83 8.83 1.25 12 1.25C15.17 1.25 17.75 3.83 17.75 7C17.75 10.17 15.17 12.75 12 12.75ZM12 2.75C9.66 2.75 7.75 4.66 7.75 7C7.75 9.34 9.66 11.25 12 11.25C14.34 11.25 16.25 9.34 16.25 7C16.25 4.66 14.34 2.75 12 2.75Z"
                      fill="white"
                    />
                    <path
                      d="M20.5901 22.75C20.1801 22.75 19.8401 22.41 19.8401 22C19.8401 18.55 16.3202 15.75 12.0002 15.75C7.68015 15.75 4.16016 18.55 4.16016 22C4.16016 22.41 3.82016 22.75 3.41016 22.75C3.00016 22.75 2.66016 22.41 2.66016 22C2.66016 17.73 6.85015 14.25 12.0002 14.25C17.1502 14.25 21.3401 17.73 21.3401 22C21.3401 22.41 21.0001 22.75 20.5901 22.75Z"
                      fill="white"
                    />
                  </svg>
                )}
              </div>
            </PhotoUpload>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full items-center justify-end gap-2 px-[10px]">
        <ECFButton variant onClick={handleSaveChanges}>
          Save Changes
        </ECFButton>
        <ECFButton variant="secondary" onClick={handleDiscard}>
          Discard
        </ECFButton>
      </div>
    </div>
  );
}
