'use client';
import {
	createColumnHelper,
	ExpandedState,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Button } from '@heroui/react';
import React from 'react';

type Milestone = {
	milestone: string;
	description: string;
	date: string;
	milestoneType: string;
	reference: string;
};

type Student = {
	studentId: number;
	name: string;
	dateOfBirth: string;
	major: string;
	canExpand?: boolean;
	subTable?: Milestone[];
};

const defaultData: Student[] = [
	{
		studentId: 1111,
		name: 'Bahar Constantia',
		dateOfBirth: '1984-01-04',
		major: 'Computer Science',
		canExpand: true,
		subTable: [
			{
				milestone: 'Milestone 1',
				description:
					'Olympic was the final Ethereum proof-of-concept released before mainnet launch. Its stated purpose was to reward participants for testing the limits of the Ethereum design by "spamming the network with transactions and doing crazy things with the state."',
				date: 'Oct. 2 2021',
				milestoneType: 'asd',
				reference: 'asd',
			},
			{
				milestone: 'Milestone 1',
				description:
					'Olympic was the final Ethereum proof-of-concept released before mainnet launch. Its stated purpose was to reward participants for testing the limits of the Ethereum design by "spamming the network with transactions and doing crazy things with the state."',
				date: 'Oct. 2 2021',
				milestoneType: 'asd',
				reference: 'asd',
			},
		],
	},
	{
		studentId: 2222,
		name: 'Harold Nona',
		dateOfBirth: '1961-05-10',
		major: 'Communications',
	},
	{
		studentId: 3333,
		name: 'Raginolf Arnulf',
		dateOfBirth: '1991-10-12',
		major: 'Business',
	},
	{
		studentId: 4444,
		name: 'Marvyn Wendi',
		dateOfBirth: '1978-09-24',
		major: 'Psychology',
	},
];

const SubTable = ({ data }: { data: Milestone[] }) => {
	const columnHelper = createColumnHelper<Milestone>();

	const columns = [
		columnHelper.accessor('milestone', {
			header: 'Milestone',
		}),
		columnHelper.accessor('description', {
			header: 'Description',
		}),
		columnHelper.accessor('date', {
			header: 'Date',
		}),
		columnHelper.accessor('milestoneType', {
			header: 'Milestone Type',
		}),
		columnHelper.accessor('reference', {
			header: 'Reference',
		}),
	];

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<table className="w-full border border-gray-300">
			<thead>
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<th
								key={header.id}
								className="border-b border-r border-gray-300 p-2 bg-gray-100 text-left last:border-r-0"
							>
								{flexRender(header.column.columnDef.header, header.getContext())}
							</th>
						))}
					</tr>
				))}
			</thead>
			<tbody>
				{table.getRowModel().rows.map((row) => (
					<tr key={row.id}>
						{row.getVisibleCells().map((cell) => (
							<td
								key={cell.id}
								className="border-b border-r border-gray-300 p-2 last:border-r-0 whitespace-pre-wrap"
							>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
};

const Table3 = () => {
	const [data, setData] = useState(() => [...defaultData]);
	const [expanded, setExpanded] = useState<ExpandedState>({});

	const columnHelper = createColumnHelper<Student>();

	const columns = [
		columnHelper.display({
			id: 'expand',
			cell: ({ row }) => {
				return row.getCanExpand() ? (
					<button onClick={row.getToggleExpandedHandler()}>
						{row.getIsExpanded() ? '👇' : '👉'}
					</button>
				) : null;
			},
		}),
		columnHelper.accessor('studentId', {
			header: 'Student ID',
		}),
		columnHelper.accessor('name', {
			header: 'Full Name',
			cell: ({ cell, row }) => {
				return (
					<div>
						<strong>{row.original.name}</strong> {row.original.major}
					</div>
				);
			},
		}),
		columnHelper.accessor('dateOfBirth', {
			header: 'Date Of Birth',
		}),
		columnHelper.accessor('major', {
			header: 'Major',
		}),
	];

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (originalRow) => String(originalRow.studentId),
		getRowCanExpand: (row) => !!row.original.canExpand,
		state: {
			expanded: expanded, // must pass expanded state back to the table
		},
		onExpandedChange: setExpanded,
	});

	return (
		<div>
			<h1>Table3</h1>

			<div className="border border-gray-300 rounded-lg overflow-hidden">
				<table className="w-full">
					<thead>
						<tr>
							<td colSpan={table.getAllColumns().length} className="overflow-hidden">
								<div className="bg-[#ededed] p-2">custom header</div>
							</td>
						</tr>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="border-b border-r border-gray-300 p-2 bg-gray-50 last:border-r-0"
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
							<React.Fragment key={row.id}>
								<tr
									onClick={() => {
										console.log('row', table.getRow(row.id));
									}}
									className="hover:bg-gray-50"
								>
									{row.getVisibleCells().map((cell) => (
										<td
											key={cell.id}
											className="border-b border-r border-gray-300 p-2 last:border-r-0"
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
								{row.getIsExpanded() && (
									<tr className="bg-yellow-50">
										<td
											colSpan={row.getAllCells().length}
											className="border-b border-gray-300 p-2"
										>
											{row.original.subTable && (
												<SubTable data={row.original.subTable} />
											)}
										</td>
									</tr>
								)}
							</React.Fragment>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Table3;
