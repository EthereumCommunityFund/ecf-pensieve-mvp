import { FC, memo, useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';

import { useUserWeightModal } from './Context';
import UserWeightCard from './UserWeightCard';

interface IUserWeightCardWithContextProps {
  className?: string;
}

/**
 * 集成了 Context 的用户权重卡片组件
 * 自动从 AuthContext 获取用户权重，并使用 UserWeightModalContext 来管理模态框
 * 这是一个便捷组件，子组件可以直接使用而无需手动传递 props
 *
 * @param className - 额外的 CSS 类名
 */
const UserWeightCardWithContext: FC<IUserWeightCardWithContextProps> = memo(
  ({ className }) => {
    const { profile } = useAuth();
    const { openUserWeightModal, setUserWeight } = useUserWeightModal();

    // 当用户权重变化时，同步更新 Context 中的权重
    useEffect(() => {
      if (profile?.weight !== undefined) {
        setUserWeight(Number(profile.weight));
      }
    }, [profile?.weight, setUserWeight]);

    const handleInfoClick = () => {
      // 确保权重是最新的
      if (profile?.weight !== undefined) {
        setUserWeight(Number(profile.weight));
      }
      openUserWeightModal();
    };

    // 如果用户未登录，不显示组件
    if (!profile) {
      return null;
    }

    return (
      <UserWeightCard
        weight={Number(profile.weight || 0)}
        onInfoClick={handleInfoClick}
        className={className}
      />
    );
  },
);

UserWeightCardWithContext.displayName = 'UserWeightCardWithContext';

export default UserWeightCardWithContext;
