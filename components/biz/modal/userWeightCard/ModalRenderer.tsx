import { FC, memo } from 'react';

import { useUserWeightModal } from './Context';
import UserWeightModal from './UserWeightModal';

/**
 * 用户权重模态框渲染器
 * 这个组件负责在 Layout 中渲染全局的用户权重模态框
 * 它监听 Context 中的状态变化并相应地显示/隐藏模态框
 */
const UserWeightModalRenderer: FC = memo(() => {
  const { isOpen, closeUserWeightModal } = useUserWeightModal();

  return <UserWeightModal isOpen={isOpen} onClose={closeUserWeightModal} />;
});

UserWeightModalRenderer.displayName = 'UserWeightModalRenderer';

export default UserWeightModalRenderer;
