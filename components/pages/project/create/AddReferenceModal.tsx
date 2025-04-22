'use client';

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import React, { useState } from 'react';

import { ReferenceData } from './types';

interface AddReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReference: (reference: ReferenceData) => void;
  fieldKey: string;
  fieldLabel?: string;
}

const AddReferenceModal: React.FC<AddReferenceModalProps> = ({
  isOpen,
  onClose,
  onAddReference,
  fieldKey,
  fieldLabel,
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // 简单验证
    if (!url || !url.trim()) {
      setError('请输入有效的引用 URL');
      return;
    }

    // 验证 URL 格式
    try {
      new URL(url);
    } catch (e) {
      setError('请输入有效的 URL');
      return;
    }

    // 提交引用
    onAddReference({
      key: fieldKey,
      ref: url.trim(),
    });

    // 重置并关闭
    setUrl('');
    setError('');
    onClose();
  };

  const handleCancel = () => {
    setUrl('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <ModalContent>
        <ModalHeader>添加引用</ModalHeader>
        <ModalBody>
          <p className="mb-4 text-gray-600">
            为字段 "{fieldLabel || fieldKey}"
            添加支持性引用链接。这可以是文档、资源或能验证信息的任何链接。
          </p>
          <Input
            label="引用 URL"
            placeholder="https://example.com/reference"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            isInvalid={!!error}
            errorMessage={error}
            autoFocus
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleCancel}>
            取消
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            添加引用
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddReferenceModal;
