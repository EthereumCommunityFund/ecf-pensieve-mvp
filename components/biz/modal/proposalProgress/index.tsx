// 组件导入
import ProposalProgressModalRendererComponent from './ModalRenderer';
import ProposalProgressModalComponent from './ProposalProgressModal';
// Context 导入
import {
  ProposalProgressModalProvider as Provider,
  useProposalProgressModal as useModal,
  type ProposalProgressModalProviderProps,
} from './Context';

// 重新导出
export const ProposalProgressModal = ProposalProgressModalComponent;
export const ProposalProgressModalRenderer =
  ProposalProgressModalRendererComponent;
export const ProposalProgressModalProvider = Provider;
export const useProposalProgressModal = useModal;
export type { ProposalProgressModalProviderProps };

// 默认导出
const ProposalProgressModalExports = {
  ProposalProgressModal,
  ProposalProgressModalRenderer,
  ProposalProgressModalProvider,
  useProposalProgressModal,
};

export default ProposalProgressModalExports;
