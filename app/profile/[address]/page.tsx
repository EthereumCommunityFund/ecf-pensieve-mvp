'use client';

import { Skeleton, Tab, Tabs, cn } from '@heroui/react';
import { GitCommit, UserSquare } from '@phosphor-icons/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import ECFTypography from '@/components/base/typography';

import Contributions from './components/contributions';
import { useProfileData } from './components/dataContext';
import Setting from './components/setting';

const tabItems = [
  {
    key: 'profile',
    label: 'Profile Settings',
    icon: <UserSquare size={32} weight="fill" />,
  },
  {
    key: 'contributions',
    label: 'Contributions',
    icon: <GitCommit size={32} weight="fill" />,
  },
];

const ProfileSettingsPage = () => {
  const { address } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useProfileData();
  const initialTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'profile' | 'contributions'>(
    initialTab === 'contributions' ? 'contributions' : 'profile',
  );

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (
      currentTab &&
      (currentTab === 'profile' || currentTab === 'contributions')
    ) {
      setActiveTab(currentTab);
    } else if (!currentTab) {
      router.push(`/profile/${address}?tab=profile`, { scroll: false });
    }
  }, [searchParams, address, router]);

  return (
    <div className="mobile:px-[10px] px-[40px]">
      <div className="tablet:w-full mx-auto flex w-full max-w-[800px] flex-col items-center gap-5 pb-16 pt-8">
        <div className="mobile:flex-col flex w-full items-center justify-center gap-[10px]">
          <div className="mobile:w-full mobile:flex-col flex gap-[5px] rounded-[10px] border border-[rgba(0,0,0,0.1)] p-[5px_10px]">
            <ECFTypography type="caption" className="opacity-50">
              Connected Address:
            </ECFTypography>
            <ECFTypography type="caption" className="opacity-80">
              {address}
            </ECFTypography>
          </div>

          <div className="mobile:w-full flex gap-[5px] rounded-[10px] border border-[rgba(0,0,0,0.1)] p-[5px_10px]">
            <ECFTypography type="caption" className="opacity-50">
              Contribution Points:
            </ECFTypography>
            <Skeleton isLoaded={!!user}>
              <ECFTypography type="caption" className="opacity-80">
                {user?.weight ?? 100}
              </ECFTypography>
            </Skeleton>
          </div>
        </div>

        <div className="w-full">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => {
              const newTab = key as 'profile' | 'contributions';
              setActiveTab(newTab);
              router.push(`/profile/${address}?tab=${newTab}`, {
                scroll: false,
              });
            }}
            variant="underlined"
            className="w-full"
            classNames={{
              tabList: 'w-full border-b border-[rgba(0,0,0,0.1)] gap-[20px]',
              tab: 'flex-1 flex justify-start items-center',
              cursor:
                'bg-black w-[102%] bottom-[-4px] left-[-4px] right-[-4px]',
              tabContent: 'font-semibold',
            }}
          >
            {tabItems.map(({ key, label, icon }) => (
              <Tab
                key={key}
                title={
                  <div className="flex items-center gap-[10px]">
                    {icon}
                    <ECFTypography
                      type="body1"
                      className={cn(
                        'font-semibold',
                        activeTab === key ? 'opacity-100' : 'opacity-60',
                      )}
                    >
                      {label}
                    </ECFTypography>
                  </div>
                }
              />
            ))}
          </Tabs>
        </div>

        {activeTab === 'profile' && <Setting />}
        {activeTab === 'contributions' && <Contributions />}
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
