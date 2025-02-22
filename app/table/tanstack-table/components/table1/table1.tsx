'use client';

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
	getExpandedRowModel,
	ExpandedState,
	Row,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import { cn } from '@heroui/react';

import { ProjectPlan } from '@/app/table/tanstack-table/types';
import EditModal from '@/app/table/tanstack-table/components/editModal';

// 模拟数据
const mockData: ProjectPlan[] = [
	{
		id: '1',
		property: 'Structure',
		input: 'Decentralized | DAO',
		reference: 'sad',
		submitter: {
			address: '0x008x...8760d3',
			time: '00/00/000',
		},
		subRows: [
			{
				id: '1-1',
				property: 'Roadmap',
				input: 'Multiple Entries',
				reference: 'Included',
				submitter: {
					address: 'etherboi',
					time: '00/00/000',
				},
			},
		],
	},
	{
		id: '2',
		property: 'Public Goods-nature',
		input: 'Yes',
		reference: 'ref(link)',
		submitter: {
			address: '0x008x...8760d3',
			time: '00/00/000',
		},
	},
];

const TanStackTable1 = () => {
	// 展开状态管理
	const [expanded, setExpanded] = useState<ExpandedState>({});
	const [data, setData] = useState<ProjectPlan[]>(mockData);
	const [editingCell, setEditingCell] = useState<{
		rowId: string;
		columnId: string;
		value: string;
	} | null>(null);

	// 处理单元格编辑
	const handleCellEdit = (rowId: string, columnId: string, value: string) => {
		setEditingCell({ rowId, columnId, value });
		console.log('editingCell', { rowId, columnId, value });
	};

	// 保存编辑后的值
	const handleSaveEdit = (newValue: string) => {
		if (!editingCell) return;

		setData((prev) =>
			prev.map((row) => {
				if (row.id === editingCell.rowId) {
					return {
						...row,
						[editingCell.columnId]: newValue,
					};
				}
				if (row.subRows) {
					return {
						...row,
						subRows: row.subRows.map((subRow) =>
							subRow.id === editingCell.rowId
								? {
										...subRow,
										[editingCell.columnId]: newValue,
									}
								: subRow,
						),
					};
				}
				return row;
			}),
		);
		setEditingCell(null);
	};

	// 定义列
	const columns = useMemo<ColumnDef<ProjectPlan>[]>(
		() => [
			{
				id: 'expander',
				header: () => null,
				cell: ({ row }) => {
					return row.getCanExpand() ? (
						<button
							className="w-6 h-6 flex items-center justify-center"
							onClick={row.getToggleExpandedHandler()}
						>
							{row.getIsExpanded() ? '👇' : '👉'}
						</button>
					) : null;
				},
			},
			{
				accessorKey: 'property',
				header: 'Property',
				cell: (info) => (
					<div
						className="cursor-pointer hover:bg-gray-100 p-1 rounded"
						onClick={() =>
							handleCellEdit(info.row.id, 'property', info.getValue() as string)
						}
					>
						{info.getValue() as string}
					</div>
				),
			},
			{
				accessorKey: 'input',
				header: 'Input',
				cell: (info) => (
					<div
						className="cursor-pointer hover:bg-gray-100 p-1 rounded"
						onClick={() =>
							handleCellEdit(info.row.id, 'input', info.getValue() as string)
						}
					>
						{info.getValue() as string}
					</div>
				),
			},
			{
				accessorKey: 'reference',
				header: 'Reference',
				cell: (info) => (
					<div
						className="cursor-pointer hover:bg-gray-100 p-1 rounded"
						onClick={() =>
							handleCellEdit(info.row.id, 'reference', info.getValue() as string)
						}
					>
						{info.getValue() as string}
					</div>
				),
			},
			{
				accessorKey: 'submitter',
				header: 'Submitter',
				cell: (info) => {
					const value = info.getValue() as ProjectPlan['submitter'];
					return (
						<div className="flex items-center gap-2">
							<span>{value.address}</span>
							<span className="text-gray-400">{value.time}</span>
						</div>
					);
				},
			},
		],
		[],
	);

	// 初始化表格
	const table = useReactTable({
		data,
		columns,
		state: {
			expanded,
		},
		onExpandedChange: setExpanded,
		getSubRows: (row) => row.subRows,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
	});

	return (
		<div className="p-5">
			<table className="w-full border-collapse">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									className="text-left p-2 border-b border-gray-200"
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr
							key={row.id}
							className={cn('hover:bg-gray-50', row.depth > 0 && 'bg-gray-50')}
						>
							{row.getVisibleCells().map((cell) => (
								<td
									key={cell.id}
									className="p-2 border-b border-gray-200"
									style={{
										paddingLeft:
											cell.column.id === 'expander'
												? `${row.depth * 2}rem`
												: undefined,
									}}
								>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>

			{editingCell && (
				<EditModal
					isOpen={true}
					onClose={() => setEditingCell(null)}
					onSave={handleSaveEdit}
					initialValue={editingCell.value}
					title={`编辑 ${editingCell.columnId}`}
				/>
			)}
		</div>
	);
};

export default TanStackTable1;
