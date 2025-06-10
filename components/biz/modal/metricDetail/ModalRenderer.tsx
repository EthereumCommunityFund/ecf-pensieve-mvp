import { FC, memo } from 'react';

import MerrticDetailModal from '@/components/biz/MerrticDetailModal';

import { useMetricDetailModal } from './Context';

/**
 * Metric 详情模态框渲染器
 * 这个组件负责在 Layout 中渲染全局的 Metric 详情模态框
 * 它监听 Context 中的状态变化并相应地显示/隐藏模态框
 */
const MetricDetailModalRenderer: FC = memo(() => {
  const { isOpen, metricTitle, metricContent, closeMetricModal } =
    useMetricDetailModal();

  return (
    <MerrticDetailModal
      isOpen={isOpen}
      onClose={closeMetricModal}
      title={metricTitle}
      metricName={metricTitle}
    >
      {metricContent}
    </MerrticDetailModal>
  );
});

MetricDetailModalRenderer.displayName = 'MetricDetailModalRenderer';

export default MetricDetailModalRenderer;
