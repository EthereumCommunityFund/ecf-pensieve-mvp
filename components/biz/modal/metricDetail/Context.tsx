'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react';

import { useMetricData } from '@/components/biz/MerrticDetailModal/useMetricData';

// Context 类型定义
interface MetricDetailModalContextType {
  // 模态框状态
  isOpen: boolean;
  selectedMetric: string;
  metricTitle: string;
  metricContent: ReactNode;

  // 操作方法
  openMetricModal: (metricName: string) => void;
  closeMetricModal: () => void;
}

// Context 默认值
const createDefaultContext = (): MetricDetailModalContextType => ({
  isOpen: false,
  selectedMetric: '',
  metricTitle: '',
  metricContent: null,
  openMetricModal: () => {},
  closeMetricModal: () => {},
});

// 创建 Context
export const MetricDetailModalContext =
  createContext<MetricDetailModalContextType>(createDefaultContext());

// Provider 组件接口
export interface MetricDetailModalProviderProps {
  children: ReactNode;
}

// Provider 组件
export const MetricDetailModalProvider = ({
  children,
}: MetricDetailModalProviderProps) => {
  // 使用现有的 useMetricData hook
  const {
    isModalOpen: isOpen,
    selectedMetric,
    metricTitle,
    metricContent,
    openModal,
    closeModal,
  } = useMetricData();

  // 包装方法以符合 Context 接口
  const openMetricModal = useCallback(
    (metricName: string) => {
      openModal(metricName);
    },
    [openModal],
  );

  const closeMetricModal = useCallback(() => {
    closeModal();
  }, [closeModal]);

  // Context 值组装 - 使用 useMemo 优化性能
  const contextValue = useMemo(
    (): MetricDetailModalContextType => ({
      isOpen,
      selectedMetric,
      metricTitle,
      metricContent,
      openMetricModal,
      closeMetricModal,
    }),
    [
      isOpen,
      selectedMetric,
      metricTitle,
      metricContent,
      openMetricModal,
      closeMetricModal,
    ],
  );

  return (
    <MetricDetailModalContext.Provider value={contextValue}>
      {children}
    </MetricDetailModalContext.Provider>
  );
};

// Hook for using the context
export const useMetricDetailModal = () => {
  const context = useContext(MetricDetailModalContext);
  if (context === undefined) {
    throw new Error(
      'useMetricDetailModal must be used within a MetricDetailModalProvider',
    );
  }
  return context;
};
