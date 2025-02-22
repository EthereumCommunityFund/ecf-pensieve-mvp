'use client';

import { useState, useMemo, ReactNode } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	ColumnDef,
	flexRender,
	ExpandedState,
	getExpandedRowModel,
} from '@tanstack/react-table';

import { Person } from './types';
import Modal from './Modal';

interface TableProps {
	data: Person[];
}

export default function TabStackTable2({ data }: TableProps) {
	// 状态管理
	const [expanded, setExpanded] = useState<ExpandedState>({});
	const [sorting, setSorting] = useState([]);
	const [filtering, setFiltering] = useState('');
	const [editCell, setEditCell] = useState<{
		row: number;
		column: string;
		value: any;
	} | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// 定义列
	const columns = useMemo<ColumnDef<Person>[]>(
		() => [
			{
				id: 'expander',
				header: () => null,
				cell: ({ row }) => {
					return row.getCanExpand() ? (
						<button className="p-2" onClick={() => row.toggleExpanded()}>
							{row.getIsExpanded() ? '👇' : '👉'}
						</button>
					) : null;
				},
			},
			{
				header: 'First Name',
				accessorKey: 'firstName',
				cell: ({ row, getValue }) => (
					<div
						className="p-2 cursor-pointer"
						onClick={() => handleCellClick(row.index, 'firstName', getValue())}
					>
						{getValue() as ReactNode}
					</div>
				),
			},
			{
				header: 'Last Name',
				accessorKey: 'lastName',
				cell: ({ row, getValue }) => (
					<div
						className="p-2 cursor-pointer"
						onClick={() => handleCellClick(row.index, 'lastName', getValue())}
					>
						{getValue() as ReactNode}
					</div>
				),
			},
			{
				header: 'Age',
				accessorKey: 'age',
				cell: ({ row, getValue }) => (
					<div
						className="p-2 cursor-pointer"
						onClick={() => handleCellClick(row.index, 'age', getValue())}
					>
						{getValue() as ReactNode}
					</div>
				),
			},
			{
				header: 'Status',
				accessorKey: 'status',
			},
			{
				header: 'Progress',
				accessorKey: 'progress',
			},
		],
		[],
	);

	// 表格实例
	const table = useReactTable({
		data,
		columns,
		state: {
			expanded,
			sorting,
			globalFilter: filtering,
		},
		onExpandedChange: setExpanded,
		// @ts-ignore
		onSortingChange: setSorting,
		onGlobalFilterChange: setFiltering,
		// @ts-ignore
		getSubRows: (row) => row.subRows,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	// 处理单元格点击
	const handleCellClick = (row: number, column: string, value: any) => {
		setEditCell({ row, column, value });
		setIsModalOpen(true);
	};

	// 处理单元格更新
	const handleCellUpdate = (newValue: any) => {
		if (editCell) {
			// 这里需要实现实际的数据更新逻辑
			console.log('Update cell:', editCell.row, editCell.column, newValue);
		}
		setIsModalOpen(false);
		setEditCell(null);
	};

	return (
		<div className="p-4">
			{/* 搜索过滤器 */}
			<div className="mb-4">
				<input
					type="text"
					value={filtering}
					onChange={(e) => setFiltering(e.target.value)}
					placeholder="Search..."
					className="p-2 border rounded"
				/>
			</div>

			{/* 表格 */}
			<table className="min-w-full border-collapse border border-gray-200">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									className="border border-gray-200 p-2 bg-gray-50"
									onClick={header.column.getToggleSortingHandler()}
								>
									{flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
									{/* 排序指示器 */}
									<span>
										{header.column.getIsSorted() === 'asc' ? ' 🔼' : ''}
										{header.column.getIsSorted() === 'desc' ? ' 🔽' : ''}
									</span>
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id} className="hover:bg-gray-50">
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="border border-gray-200">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>

			{/* 分页控制 */}
			<div className="mt-4 flex gap-2">
				<button
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
					className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
				>
					Previous
				</button>
				<button
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
					className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
				>
					Next
				</button>
			</div>

			{/* 编辑弹窗 */}
			{isModalOpen && editCell && (
				<Modal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSave={handleCellUpdate}
					initialValue={editCell.value}
				/>
			)}
		</div>
	);
}
