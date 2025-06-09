// 组件导入
import UserWeightModalRendererComponent from './ModalRenderer';
import UserWeightCardComponent from './UserWeightCard';
import UserWeightCardWithContextComponent from './UserWeightCardWithContext';
import UserWeightModalComponent from './UserWeightModal';
// Context 导入
import {
  UserWeightModalProvider as Provider,
  useUserWeightModal as useModal,
  type UserWeightModalProviderProps,
} from './Context';

// 重新导出
export const UserWeightCard = UserWeightCardComponent;
export const UserWeightModal = UserWeightModalComponent;
export const UserWeightCardWithContext = UserWeightCardWithContextComponent;
export const UserWeightModalRenderer = UserWeightModalRendererComponent;
export const UserWeightModalProvider = Provider;
export const useUserWeightModal = useModal;
export type { UserWeightModalProviderProps };

// 默认导出
const UserWeightModalExports = {
  UserWeightCard,
  UserWeightModal,
  UserWeightCardWithContext,
  UserWeightModalRenderer,
  UserWeightModalProvider,
  useUserWeightModal,
};

export default UserWeightModalExports;
