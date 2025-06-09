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
interface UserWeightModalContextType {
  // 模态框状态
  isOpen: boolean;
  userWeight: number;

  // 操作方法
  openUserWeightModal: () => void;
  closeUserWeightModal: () => void;
  setUserWeight: (weight: number) => void;
}

// Context 默认值
const createDefaultContext = (): UserWeightModalContextType => ({
  isOpen: false,
  userWeight: 0,
  openUserWeightModal: () => {},
  closeUserWeightModal: () => {},
  setUserWeight: () => {},
});

// 创建 Context
export const UserWeightModalContext = createContext<UserWeightModalContextType>(
  createDefaultContext(),
);

// Provider 组件接口
export interface UserWeightModalProviderProps {
  children: ReactNode;
}

// Provider 组件
export const UserWeightModalProvider = ({
  children,
}: UserWeightModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userWeight, setUserWeightState] = useState(0);

  const openUserWeightModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeUserWeightModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setUserWeight = useCallback((weight: number) => {
    setUserWeightState(weight);
  }, []);

  // Context 值组装 - 使用 useMemo 优化性能
  const contextValue = useMemo(
    (): UserWeightModalContextType => ({
      isOpen,
      userWeight,
      openUserWeightModal,
      closeUserWeightModal,
      setUserWeight,
    }),
    [
      isOpen,
      userWeight,
      openUserWeightModal,
      closeUserWeightModal,
      setUserWeight,
    ],
  );

  return (
    <UserWeightModalContext.Provider value={contextValue}>
      {children}
    </UserWeightModalContext.Provider>
  );
};

// Hook for using the context
export const useUserWeightModal = () => {
  const context = useContext(UserWeightModalContext);
  if (context === undefined) {
    throw new Error(
      'useUserWeightModal must be used within a UserWeightModalProvider',
    );
  }
  return context;
};
