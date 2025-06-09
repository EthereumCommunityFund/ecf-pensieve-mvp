'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useProjectDetailContext } from '@/components/pages/project/context/projectDetailContext';

// 定义 Modal 专用的 Context 类型，只包含 Modal 需要的稳定数据
interface ModalContextType {
  // 稳定的数据，不会频繁变化
  itemKey: string | null;
  itemName: string;

  // 从 ProjectDetailContext 中提取的稳定引用
  setCurrentItemKey: (key: string | null) => void;

  // 其他稳定的配置
  showRewardCard: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
  itemKey: string | null;
  itemName: string;
  showRewardCard: boolean;
}

export const ModalProvider = ({
  children,
  itemKey,
  itemName,
  showRewardCard,
}: ModalProviderProps) => {
  const { setCurrentItemKey } = useProjectDetailContext();

  // 使用 useMemo 来稳定化 context value，避免不必要的重渲染
  const value = useMemo(
    () => ({
      itemKey,
      itemName,
      setCurrentItemKey,
      showRewardCard,
    }),
    [itemKey, itemName, setCurrentItemKey, showRewardCard],
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};
