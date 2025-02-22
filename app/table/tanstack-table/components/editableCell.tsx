import { useState, useEffect, useRef } from 'react';
import { Cell } from '@tanstack/react-table';

import { ProjectPlan } from '../types';

interface EditableCellProps {
	cell: Cell<ProjectPlan, unknown>;
	onSave: (value: string) => void;
}

const EditableCell = ({ cell, onSave }: EditableCellProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [value, setValue] = useState<string>(cell.getValue() as string);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	const handleDoubleClick = () => {
		setIsEditing(true);
	};

	const handleBlur = () => {
		setIsEditing(false);
		if (value !== cell.getValue()) {
			onSave(value);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			setIsEditing(false);
			if (value !== cell.getValue()) {
				onSave(value);
			}
		} else if (e.key === 'Escape') {
			setIsEditing(false);
			setValue(cell.getValue() as string);
		}
	};

	if (isEditing) {
		return (
			<input
				ref={inputRef}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				className="w-full p-1 border border-blue-500 rounded focus:outline-none"
			/>
		);
	}

	return (
		<div
			onDoubleClick={handleDoubleClick}
			className="cursor-pointer hover:bg-gray-100 p-1 rounded"
		>
			{value}
		</div>
	);
};

export default EditableCell;
