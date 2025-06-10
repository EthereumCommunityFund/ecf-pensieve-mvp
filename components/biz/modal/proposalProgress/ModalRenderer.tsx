import { FC, memo } from 'react';

import { useProposalProgressModal } from './Context';
import ProposalProgressModal from './ProposalProgressModal';

/**
 * 提案进度模态框渲染器
 * 这个组件负责在 Layout 中渲染全局的提案进度模态框
 * 它监听 Context 中的状态变化并相应地显示/隐藏模态框
 */
const ProposalProgressModalRenderer: FC = memo(() => {
  const { isOpen, closeProposalProgressModal } = useProposalProgressModal();

  return (
    <ProposalProgressModal
      isOpen={isOpen}
      onClose={closeProposalProgressModal}
    />
  );
});

ProposalProgressModalRenderer.displayName = 'ProposalProgressModalRenderer';

export default ProposalProgressModalRenderer;
