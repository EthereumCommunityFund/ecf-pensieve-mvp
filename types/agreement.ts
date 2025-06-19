// 免责声明相关类型定义
export interface AgreementStep {
  id: string;
  title: string;
  content: React.ReactNode;
  requireScrollToEnd?: boolean;
}

export interface AgreementModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

export interface AgreementStepProps {
  step: AgreementStep;
  currentStepIndex: number;
  totalSteps: number;
  onAgree: () => void;
  onCancel: () => void;
  isAgreed: boolean;
  canProceed: boolean;
}

export interface ScrollDetectorProps {
  onScrollToEnd: (hasScrolledToEnd: boolean) => void;
  threshold?: number;
  children: React.ReactNode;
}
