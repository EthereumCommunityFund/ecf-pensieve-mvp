'use client';

import { useState } from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (value: any) => void;
	initialValue: any;
}

export default function Modal({ isOpen, onClose, onSave, initialValue }: ModalProps) {
	const [value, setValue] = useState(initialValue);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
			<div className="bg-white p-4 rounded-lg min-w-[300px]">
				<h2 className="text-lg font-bold mb-4">Edit Value</h2>
				<input
					type="text"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					className="w-full p-2 border rounded mb-4"
				/>
				<div className="flex justify-end gap-2">
					<button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
						Cancel
					</button>
					<button
						onClick={() => onSave(value)}
						className="px-4 py-2 bg-blue-500 text-white rounded"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
}
