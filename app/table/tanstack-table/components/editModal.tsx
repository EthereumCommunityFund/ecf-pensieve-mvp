import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { useState } from 'react';

interface EditModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (value: string) => void;
	initialValue: string;
	title: string;
}

const EditModal = ({ isOpen, onClose, onSave, initialValue, title }: EditModalProps) => {
	const [value, setValue] = useState(initialValue);

	const handleSave = () => {
		onSave(value);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalContent>
				<ModalHeader>{title}</ModalHeader>
				<ModalBody>
					<input
						type="text"
						value={value}
						onChange={(e) => setValue(e.target.value)}
						className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						autoFocus
					/>
				</ModalBody>
				<ModalFooter>
					<Button variant="ghost" onPress={onClose}>
						取消
					</Button>
					<Button onPress={handleSave}>保存</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default EditModal;
