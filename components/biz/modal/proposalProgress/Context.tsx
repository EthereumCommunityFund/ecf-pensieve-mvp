'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

// Context 类型定义
interface ProposalProgressModalContextType {
  // 模态框状态
  isOpen: boolean;

  // 操作方法
  openProposalProgressModal: () => void;
  closeProposalProgressModal: () => void;
}

// Context 默认值
const createDefaultContext = (): ProposalProgressModalContextType => ({
  isOpen: false,
  openProposalProgressModal: () => {},
  closeProposalProgressModal: () => {},
});

// 创建 Context
export const ProposalProgressModalContext =
  createContext<ProposalProgressModalContextType>(createDefaultContext());

// Provider 组件接口
export interface ProposalProgressModalProviderProps {
  children: ReactNode;
}

// Provider 组件
export const ProposalProgressModalProvider = ({
  children,
}: ProposalProgressModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openProposalProgressModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeProposalProgressModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Context 值组装 - 使用 useMemo 优化性能
  const contextValue = useMemo(
    (): ProposalProgressModalContextType => ({
      isOpen,
      openProposalProgressModal,
      closeProposalProgressModal,
    }),
    [isOpen, openProposalProgressModal, closeProposalProgressModal],
  );

  return (
    <ProposalProgressModalContext.Provider value={contextValue}>
      {children}
    </ProposalProgressModalContext.Provider>
  );
};

// Hook for using the context
export const useProposalProgressModal = () => {
  const context = useContext(ProposalProgressModalContext);
  if (context === undefined) {
    throw new Error(
      'useProposalProgressModal must be used within a ProposalProgressModalProvider',
    );
  }
  return context;
};
