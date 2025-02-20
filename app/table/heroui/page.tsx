'use client';

import React, { SVGProps } from 'react';
import {
	Button,
	DropdownTrigger,
	Dropdown,
	DropdownMenu,
	DropdownItem,
	Pagination,
	ChipProps,
	SortDescriptor,
	Input,
} from '@heroui/react';
import {
	Table,
	TableHeader,
	TableColumn,
	TableBody,
	TableRow,
	TableCell,
	getKeyValue,
	User,
	Chip,
	Tooltip,
	RadioGroup,
	Radio,
} from '@heroui/react';
import { useCallback, useState } from 'react';
import type { Selection } from '@heroui/react';

export default function TableHerouiPage() {
	return (
		<>
			<DefaultTable />

			<DynamicTable />

			<CustomCellTable />

			<SingleRowSelectionTable />

			<MultiRowSelectionTable />

			<ControlledTable />

			<CustomStyleTable />
		</>
	);
}

const DefaultTable = () => {
	return (
		<>
			<h2>default table</h2>

			<Table aria-label="Example static collection table">
				<TableHeader>
					<TableColumn>NAME</TableColumn>
					<TableColumn>ROLE</TableColumn>
					<TableColumn>STATUS</TableColumn>
				</TableHeader>
				<TableBody>
					<TableRow key="1">
						<TableCell>Tony Reichert</TableCell>
						<TableCell>CEO</TableCell>
						<TableCell>Active</TableCell>
					</TableRow>
					<TableRow key="2">
						<TableCell>Zoey Lang</TableCell>
						<TableCell>Technical Lead</TableCell>
						<TableCell>Paused</TableCell>
					</TableRow>
					<TableRow key="3">
						<TableCell>Jane Fisher</TableCell>
						<TableCell>Senior Developer</TableCell>
						<TableCell>Active</TableCell>
					</TableRow>
					<TableRow key="4">
						<TableCell>William Howard</TableCell>
						<TableCell>Community Manager</TableCell>
						<TableCell>Vacation</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</>
	);
};

const DynamicTable = () => {
	// 生成随机测试数据的函数
	const generateMockData = (count: number) => {
		// 定义数据池
		const names = [
			'张三',
			'李四',
			'王五',
			'John',
			'Emma',
			'Michael',
			'Sarah',
			'David',
			'Linda',
		];
		const roles = ['工程师', '产品经理', '设计师', 'CEO', '技术主管', '项目经理', '运营总监'];
		const statuses = ['Active', 'Paused', 'Vacation', 'Offline', 'Online'];

		// 生成随机数据
		return Array.from({ length: count }, (_, index) => ({
			key: (index + 1).toString(),
			name: names[Math.floor(Math.random() * names.length)],
			role: roles[Math.floor(Math.random() * roles.length)],
			status: statuses[Math.floor(Math.random() * statuses.length)],
		}));
	};
	// 使用生成的2000条测试数据替换原有的rows
	const rows = generateMockData(5);

	const columns = [
		{
			key: 'name',
			label: 'NAME',
		},
		{
			key: 'role',
			label: 'ROLE',
		},
		{
			key: 'status',
			label: 'STATUS',
		},
	];
	return (
		<>
			<h2 className="mt-10">Dynamic Table</h2>
			<Table removeWrapper aria-label="Example table with dynamic content">
				<TableHeader columns={columns}>
					{(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
				</TableHeader>
				<TableBody items={rows}>
					{(item) => (
						<TableRow key={item.key}>
							{(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
						</TableRow>
					)}
				</TableBody>
			</Table>
		</>
	);
};

function CustomCellTable() {
	const columns2 = [
		{ name: 'ROLE', uid: 'role' },
		{ name: 'STATUS', uid: 'status' },
		{ name: 'ACTIONS', uid: 'actions' },
	];

	const users = [
		{
			id: 1,
			name: 'Tony Reichert',
			role: 'CEO',
			team: 'Management',
			status: 'active',
			age: '29',
			avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
			email: 'tony.reichert@example.com',
		},
		{
			id: 2,
			name: 'Zoey Lang',
			role: 'Technical Lead',
			team: 'Development',
			status: 'paused',
			age: '25',
			avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
			email: 'zoey.lang@example.com',
		},
		{
			id: 3,
			name: 'Jane Fisher',
			role: 'Senior Developer',
			team: 'Development',
			status: 'active',
			age: '22',
			avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
			email: 'jane.fisher@example.com',
		},
		{
			id: 4,
			name: 'William Howard',
			role: 'Community Manager',
			team: 'Marketing',
			status: 'vacation',
			age: '28',
			avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d',
			email: 'william.howard@example.com',
		},
		{
			id: 5,
			name: 'Kristen Copper',
			role: 'Sales Manager',
			team: 'Sales',
			status: 'active',
			age: '24',
			avatar: 'https://i.pravatar.cc/150?u=a092581d4ef9026700d',
			email: 'kristen.cooper@example.com',
		},
	];

	const EyeIcon = (props: any) => {
		return (
			<svg
				aria-hidden="true"
				fill="none"
				focusable="false"
				height="1em"
				role="presentation"
				viewBox="0 0 20 20"
				width="1em"
				{...props}
			>
				<path
					d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
				/>
				<path
					d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00831 17.5917 7.83331C15.6833 4.83331 12.9417 3.09998 9.99999 3.09998C7.05833 3.09998 4.31666 4.83331 2.40833 7.83331C1.65833 9.00831 1.65833 10.9833 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916Z"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
				/>
			</svg>
		);
	};

	const DeleteIcon = (props: any) => {
		return (
			<svg
				aria-hidden="true"
				fill="none"
				focusable="false"
				height="1em"
				role="presentation"
				viewBox="0 0 20 20"
				width="1em"
				{...props}
			>
				<path
					d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
				/>
				<path
					d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
				/>
				<path
					d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
				/>
				<path
					d="M8.60834 13.75H11.3833"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
				/>
				<path
					d="M7.91669 10.4167H12.0834"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
				/>
			</svg>
		);
	};

	const EditIcon = (props: any) => {
		return (
			<svg
				aria-hidden="true"
				fill="none"
				focusable="false"
				height="1em"
				role="presentation"
				viewBox="0 0 20 20"
				width="1em"
				{...props}
			>
				<path
					d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeMiterlimit={10}
					strokeWidth={1.5}
				/>
				<path
					d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeMiterlimit={10}
					strokeWidth={1.5}
				/>
				<path
					d="M2.5 18.3333H17.5"
					stroke="currentColor"
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeMiterlimit={10}
					strokeWidth={1.5}
				/>
			</svg>
		);
	};

	const statusColorMap: Record<string, string> = {
		active: 'success',
		paused: 'danger',
		vacation: 'warning',
	};

	const renderCell = useCallback((user: any, columnKey: string) => {
		const cellValue = user[columnKey];

		switch (columnKey) {
			case 'name':
				return (
					<User
						avatarProps={{ radius: 'lg', src: user.avatar }}
						description={user.email}
						name={cellValue}
					>
						{user.email}
					</User>
				);
			case 'role':
				return (
					<div className="flex flex-col">
						<p className="text-bold text-sm capitalize">{cellValue}</p>
						<p className="text-bold text-sm capitalize text-default-400">{user.team}</p>
					</div>
				);
			case 'status':
				return (
					<Chip
						className="capitalize"
						color={
							statusColorMap[user.status] as
							| 'success'
							| 'danger'
							| 'warning'
							| 'default'
							| 'primary'
							| 'secondary'
						}
						size="sm"
						variant="flat"
					>
						{cellValue}
					</Chip>
				);
			case 'actions':
				return (
					<div className="relative flex items-center gap-2">
						<Tooltip content="Details">
							<span className="text-lg text-default-400 cursor-pointer active:opacity-50">
								<EyeIcon />
							</span>
						</Tooltip>
						<Tooltip content="Edit user">
							<span className="text-lg text-default-400 cursor-pointer active:opacity-50">
								<EditIcon />
							</span>
						</Tooltip>
						<Tooltip color="danger" content="Delete user">
							<span className="text-lg text-danger cursor-pointer active:opacity-50">
								<DeleteIcon />
							</span>
						</Tooltip>
					</div>
				);
			default:
				return cellValue;
		}
	}, []);

	return (
		<>
			<h2 className="mt-10">Custom Cell Table</h2>
			<Table aria-label="Example table with custom cells">
				<TableHeader columns={columns2}>
					{(column) => (
						<TableColumn
							key={column.uid}
							align={column.uid === 'actions' ? 'center' : 'start'}
						>
							{column.name}
						</TableColumn>
					)}
				</TableHeader>
				<TableBody items={users}>
					{(item) => (
						<TableRow key={item.id}>
							{(columnKey) => (
								<TableCell>{renderCell(item, columnKey as string)}</TableCell>
							)}
						</TableRow>
					)}
				</TableBody>
			</Table>
		</>
	);
}

function SingleRowSelectionTable() {
	const [selectedColor, setSelectedColor] = useState('default');

	const colors = ['default', 'primary', 'secondary', 'success', 'warning', 'danger'];

	return (
		<div className="flex flex-col gap-3">
			<h2 className="mt-10">SingleRowSelectionTable</h2>
			<Table
				aria-label="Example static collection table"
				color={
					selectedColor as
					| 'default'
					| 'primary'
					| 'secondary'
					| 'success'
					| 'warning'
					| 'danger'
				}
				defaultSelectedKeys={['2']}
				selectionMode="single"
			>
				<TableHeader>
					<TableColumn>NAME</TableColumn>
					<TableColumn>ROLE</TableColumn>
					<TableColumn>STATUS</TableColumn>
				</TableHeader>
				<TableBody>
					<TableRow key="1">
						<TableCell>Tony Reichert</TableCell>
						<TableCell>CEO</TableCell>
						<TableCell>Active</TableCell>
					</TableRow>
					<TableRow key="2">
						<TableCell>Zoey Lang</TableCell>
						<TableCell>Technical Lead</TableCell>
						<TableCell>Paused</TableCell>
					</TableRow>
					<TableRow key="3">
						<TableCell>Jane Fisher</TableCell>
						<TableCell>Senior Developer</TableCell>
						<TableCell>Active</TableCell>
					</TableRow>
					<TableRow key="4">
						<TableCell>William Howard</TableCell>
						<TableCell>Community Manager</TableCell>
						<TableCell>Vacation</TableCell>
					</TableRow>
				</TableBody>
			</Table>
			<RadioGroup
				label="Selection color"
				orientation="horizontal"
				value={selectedColor}
				onValueChange={setSelectedColor}
			>
				{colors.map((color) => (
					<Radio
						key={color}
						className="capitalize"
						color={
							color as
							| 'default'
							| 'primary'
							| 'secondary'
							| 'success'
							| 'warning'
							| 'danger'
						}
						value={color}
					>
						{color}
					</Radio>
				))}
			</RadioGroup>
		</div>
	);
}

function MultiRowSelectionTable() {
	const [selectedColor, setSelectedColor] = useState('default');

	const colors = ['default', 'primary', 'secondary', 'success', 'warning', 'danger'];

	return (
		<div className="flex flex-col gap-3">
			<h2 className="mt-10">MultiRowSelectionTable</h2>
			<Table
				aria-label="Example static collection table"
				color={
					selectedColor as
					| 'default'
					| 'primary'
					| 'secondary'
					| 'success'
					| 'warning'
					| 'danger'
				}
				defaultSelectedKeys={['1', '3']}
				selectionMode="multiple"
			>
				<TableHeader>
					<TableColumn>NAME</TableColumn>
					<TableColumn>ROLE</TableColumn>
					<TableColumn>STATUS</TableColumn>
				</TableHeader>
				<TableBody>
					<TableRow key="1">
						<TableCell>Tony Reichert</TableCell>
						<TableCell>CEO</TableCell>
						<TableCell>Active</TableCell>
					</TableRow>
					<TableRow key="2">
						<TableCell>Zoey Lang</TableCell>
						<TableCell>Technical Lead</TableCell>
						<TableCell>Paused</TableCell>
					</TableRow>
					<TableRow key="3">
						<TableCell>Jane Fisher</TableCell>
						<TableCell>Senior Developer</TableCell>
						<TableCell>Active</TableCell>
					</TableRow>
					<TableRow key="4">
						<TableCell>William Howard</TableCell>
						<TableCell>Community Manager</TableCell>
						<TableCell>Vacation</TableCell>
					</TableRow>
				</TableBody>
			</Table>
			<RadioGroup
				label="Selection color"
				orientation="horizontal"
				value={selectedColor}
				onValueChange={setSelectedColor}
			>
				{colors.map((color) => (
					<Radio
						key={color}
						className="capitalize"
						color={
							color as
							| 'default'
							| 'primary'
							| 'secondary'
							| 'success'
							| 'warning'
							| 'danger'
						}
						value={color}
					>
						{color}
					</Radio>
				))}
			</RadioGroup>
		</div>
	);
}

function ControlledTable() {
	const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(['2']));

	const rows = [
		{
			key: '1',
			name: 'Tony Reichert',
			role: 'CEO',
			status: 'Active',
		},
		{
			key: '2',
			name: 'Zoey Lang',
			role: 'Technical Lead',
			status: 'Paused',
		},
		{
			key: '3',
			name: 'Jane Fisher',
			role: 'Senior Developer',
			status: 'Active',
		},
		{
			key: '4',
			name: 'William Howard',
			role: 'Community Manager',
			status: 'Vacation',
		},
	];

	const columns = [
		{
			key: 'name',
			label: 'NAME',
		},
		{
			key: 'role',
			label: 'ROLE',
		},
		{
			key: 'status',
			label: 'STATUS',
		},
	];

	const onRowSelect = (key: any) => {
		console.log('onRowSelect', key);
	};

	return (
		<Table
			aria-label="Controlled table example with dynamic content"
			selectedKeys={selectedKeys}
			selectionMode="multiple"
			onSelectionChange={setSelectedKeys}
			onRowAction={onRowSelect}
		>
			<TableHeader columns={columns}>
				{(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
			</TableHeader>
			<TableBody items={rows}>
				{(item) => (
					<TableRow key={item.key}>
						{(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}

type IconSvgProps = SVGProps<SVGSVGElement> & {
	size?: number;
};

const columns = [
	{ name: 'ID', uid: 'id', sortable: true },
	{ name: 'NAME', uid: 'name', sortable: true },
	{ name: 'AGE', uid: 'age', sortable: true },
	{ name: 'ROLE', uid: 'role', sortable: true },
	{ name: 'TEAM', uid: 'team' },
	{ name: 'EMAIL', uid: 'email' },
	{ name: 'STATUS', uid: 'status', sortable: true },
	{ name: 'ACTIONS', uid: 'actions' },
];

const statusOptions = [
	{ name: 'Active', uid: 'active' },
	{ name: 'Paused', uid: 'paused' },
	{ name: 'Vacation', uid: 'vacation' },
];

const users = [
	{
		id: 1,
		name: 'Tony Reichert',
		role: 'CEO',
		team: 'Management',
		status: 'active',
		age: '29',
		avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
		email: 'tony.reichert@example.com',
	},
	{
		id: 2,
		name: 'Zoey Lang',
		role: 'Tech Lead',
		team: 'Development',
		status: 'paused',
		age: '25',
		avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
		email: 'zoey.lang@example.com',
	},
	{
		id: 3,
		name: 'Jane Fisher',
		role: 'Sr. Dev',
		team: 'Development',
		status: 'active',
		age: '22',
		avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
		email: 'jane.fisher@example.com',
	},
	{
		id: 4,
		name: 'William Howard',
		role: 'C.M.',
		team: 'Marketing',
		status: 'vacation',
		age: '28',
		avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d',
		email: 'william.howard@example.com',
	},
	{
		id: 5,
		name: 'Kristen Copper',
		role: 'S. Manager',
		team: 'Sales',
		status: 'active',
		age: '24',
		avatar: 'https://i.pravatar.cc/150?u=a092581d4ef9026700d',
		email: 'kristen.cooper@example.com',
	},
	{
		id: 6,
		name: 'Brian Kim',
		role: 'P. Manager',
		team: 'Management',
		age: '29',
		avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
		email: 'brian.kim@example.com',
		status: 'active',
	},
	{
		id: 7,
		name: 'Michael Hunt',
		role: 'Designer',
		team: 'Design',
		status: 'paused',
		age: '27',
		avatar: 'https://i.pravatar.cc/150?u=a042581f4e29027007d',
		email: 'michael.hunt@example.com',
	},
	{
		id: 8,
		name: 'Samantha Brooks',
		role: 'HR Manager',
		team: 'HR',
		status: 'active',
		age: '31',
		avatar: 'https://i.pravatar.cc/150?u=a042581f4e27027008d',
		email: 'samantha.brooks@example.com',
	},
	{
		id: 9,
		name: 'Frank Harrison',
		role: 'F. Manager',
		team: 'Finance',
		status: 'vacation',
		age: '33',
		avatar: 'https://i.pravatar.cc/150?img=4',
		email: 'frank.harrison@example.com',
	},
	{
		id: 10,
		name: 'Emma Adams',
		role: 'Ops Manager',
		team: 'Operations',
		status: 'active',
		age: '35',
		avatar: 'https://i.pravatar.cc/150?img=5',
		email: 'emma.adams@example.com',
	},
	{
		id: 11,
		name: 'Brandon Stevens',
		role: 'Jr. Dev',
		team: 'Development',
		status: 'active',
		age: '22',
		avatar: 'https://i.pravatar.cc/150?img=8',
		email: 'brandon.stevens@example.com',
	},
	{
		id: 12,
		name: 'Megan Richards',
		role: 'P. Manager',
		team: 'Product',
		status: 'paused',
		age: '28',
		avatar: 'https://i.pravatar.cc/150?img=10',
		email: 'megan.richards@example.com',
	},
	{
		id: 13,
		name: 'Oliver Scott',
		role: 'S. Manager',
		team: 'Security',
		status: 'active',
		age: '37',
		avatar: 'https://i.pravatar.cc/150?img=12',
		email: 'oliver.scott@example.com',
	},
	{
		id: 14,
		name: 'Grace Allen',
		role: 'M. Specialist',
		team: 'Marketing',
		status: 'active',
		age: '30',
		avatar: 'https://i.pravatar.cc/150?img=16',
		email: 'grace.allen@example.com',
	},
	{
		id: 15,
		name: 'Noah Carter',
		role: 'IT Specialist',
		team: 'I. Technology',
		status: 'paused',
		age: '31',
		avatar: 'https://i.pravatar.cc/150?img=15',
		email: 'noah.carter@example.com',
	},
	{
		id: 16,
		name: 'Ava Perez',
		role: 'Manager',
		team: 'Sales',
		status: 'active',
		age: '29',
		avatar: 'https://i.pravatar.cc/150?img=20',
		email: 'ava.perez@example.com',
	},
	{
		id: 17,
		name: 'Liam Johnson',
		role: 'Data Analyst',
		team: 'Analysis',
		status: 'active',
		age: '28',
		avatar: 'https://i.pravatar.cc/150?img=33',
		email: 'liam.johnson@example.com',
	},
	{
		id: 18,
		name: 'Sophia Taylor',
		role: 'QA Analyst',
		team: 'Testing',
		status: 'active',
		age: '27',
		avatar: 'https://i.pravatar.cc/150?img=29',
		email: 'sophia.taylor@example.com',
	},
	{
		id: 19,
		name: 'Lucas Harris',
		role: 'Administrator',
		team: 'Information Technology',
		status: 'paused',
		age: '32',
		avatar: 'https://i.pravatar.cc/150?img=50',
		email: 'lucas.harris@example.com',
	},
	{
		id: 20,
		name: 'Mia Robinson',
		role: 'Coordinator',
		team: 'Operations',
		status: 'active',
		age: '26',
		avatar: 'https://i.pravatar.cc/150?img=45',
		email: 'mia.robinson@example.com',
	},
];

function capitalize(s: string) {
	return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
}

const PlusIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height={size || height}
			role="presentation"
			viewBox="0 0 24 24"
			width={size || width}
			{...props}
		>
			<g
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
			>
				<path d="M6 12h12" />
				<path d="M12 18V6" />
			</g>
		</svg>
	);
};

const VerticalDotsIcon = ({ size = 24, width, height, ...props }: IconSvgProps) => {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height={size || height}
			role="presentation"
			viewBox="0 0 24 24"
			width={size || width}
			{...props}
		>
			<path
				d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
				fill="currentColor"
			/>
		</svg>
	);
};

const SearchIcon = (props: IconSvgProps) => {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height="1em"
			role="presentation"
			viewBox="0 0 24 24"
			width="1em"
			{...props}
		>
			<path
				d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
			/>
			<path
				d="M22 22L20 20"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
			/>
		</svg>
	);
};

const ChevronDownIcon = ({ strokeWidth = 1.5, ...otherProps }: IconSvgProps) => {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			focusable="false"
			height="1em"
			role="presentation"
			viewBox="0 0 24 24"
			width="1em"
			{...otherProps}
		>
			<path
				d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeMiterlimit={10}
				strokeWidth={strokeWidth}
			/>
		</svg>
	);
};

const statusColorMap: Record<string, ChipProps['color']> = {
	active: 'success',
	paused: 'danger',
	vacation: 'warning',
};

const INITIAL_VISIBLE_COLUMNS = ['name', 'role', 'status', 'actions'];

type User = (typeof users)[0];

function CustomStyleTable() {
	const [filterValue, setFilterValue] = React.useState('');
	const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
	const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
		new Set(INITIAL_VISIBLE_COLUMNS),
	);
	const [statusFilter, setStatusFilter] = React.useState<Selection>('all');
	const [rowsPerPage, setRowsPerPage] = React.useState(5);
	const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
		column: 'age',
		direction: 'ascending',
	});
	const [page, setPage] = React.useState(1);

	const pages = Math.ceil(users.length / rowsPerPage);

	const hasSearchFilter = Boolean(filterValue);

	const headerColumns = React.useMemo(() => {
		if (visibleColumns === 'all') return columns;

		return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
	}, [visibleColumns]);

	const filteredItems = React.useMemo(() => {
		let filteredUsers = [...users];

		if (hasSearchFilter) {
			filteredUsers = filteredUsers.filter((user) =>
				user.name.toLowerCase().includes(filterValue.toLowerCase()),
			);
		}
		if (statusFilter !== 'all' && Array.from(statusFilter).length !== statusOptions.length) {
			filteredUsers = filteredUsers.filter((user) =>
				Array.from(statusFilter).includes(user.status),
			);
		}

		return filteredUsers;
	}, [users, filterValue, statusFilter]);

	const items = React.useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const end = start + rowsPerPage;

		return filteredItems.slice(start, end);
	}, [page, filteredItems, rowsPerPage]);

	const sortedItems = React.useMemo(() => {
		return [...items].sort((a: User, b: User) => {
			const first = a[sortDescriptor.column as keyof User] as number;
			const second = b[sortDescriptor.column as keyof User] as number;
			const cmp = first < second ? -1 : first > second ? 1 : 0;

			return sortDescriptor.direction === 'descending' ? -cmp : cmp;
		});
	}, [sortDescriptor, items]);

	const renderCell = React.useCallback((user: User, columnKey: React.Key) => {
		const cellValue = user[columnKey as keyof User];

		switch (columnKey) {
			case 'name':
				return (
					<User
						avatarProps={{ radius: 'full', size: 'sm', src: user.avatar }}
						classNames={{
							description: 'text-default-500',
						}}
						description={user.email}
						name={cellValue}
					>
						{user.email}
					</User>
				);
			case 'role':
				return (
					<div className="flex flex-col">
						<p className="text-bold text-small capitalize">{cellValue}</p>
						<p className="text-bold text-tiny capitalize text-default-500">
							{user.team}
						</p>
					</div>
				);
			case 'status':
				return (
					<Chip
						className="capitalize border-none gap-1 text-default-600"
						color={statusColorMap[user.status]}
						size="sm"
						variant="dot"
					>
						{cellValue}
					</Chip>
				);
			case 'actions':
				return (
					<div className="relative flex justify-end items-center gap-2">
						<Dropdown className="bg-background border-1 border-default-200">
							<DropdownTrigger>
								<Button isIconOnly radius="full" size="sm" variant="light">
									<VerticalDotsIcon className="text-default-400" />
								</Button>
							</DropdownTrigger>
							<DropdownMenu>
								<DropdownItem key="view">View</DropdownItem>
								<DropdownItem key="edit">Edit</DropdownItem>
								<DropdownItem key="delete">Delete</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				);
			default:
				return cellValue;
		}
	}, []);

	const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		setRowsPerPage(Number(e.target.value));
		setPage(1);
	}, []);

	const onSearchChange = React.useCallback((value?: string) => {
		if (value) {
			setFilterValue(value);
			setPage(1);
		} else {
			setFilterValue('');
		}
	}, []);

	const topContent = React.useMemo(() => {
		return (
			<div className="flex flex-col gap-4">
				<div className="flex justify-between gap-3 items-end">
					<Input
						isClearable
						classNames={{
							base: 'w-full sm:max-w-[44%]',
							inputWrapper: 'border-1',
						}}
						placeholder="Search by name..."
						size="sm"
						startContent={<SearchIcon className="text-default-300" />}
						value={filterValue}
						variant="bordered"
						onClear={() => setFilterValue('')}
						onValueChange={onSearchChange}
					/>
					<div className="flex gap-3">
						<Dropdown>
							<DropdownTrigger className="hidden sm:flex">
								<Button
									endContent={<ChevronDownIcon className="text-small" />}
									size="sm"
									variant="flat"
								>
									Status
								</Button>
							</DropdownTrigger>
							<DropdownMenu
								disallowEmptySelection
								aria-label="Table Columns"
								closeOnSelect={false}
								selectedKeys={statusFilter}
								selectionMode="multiple"
								onSelectionChange={setStatusFilter}
							>
								{statusOptions.map((status) => (
									<DropdownItem key={status.uid} className="capitalize">
										{capitalize(status.name)}
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>
						<Dropdown>
							<DropdownTrigger className="hidden sm:flex">
								<Button
									endContent={<ChevronDownIcon className="text-small" />}
									size="sm"
									variant="flat"
								>
									Columns
								</Button>
							</DropdownTrigger>
							<DropdownMenu
								disallowEmptySelection
								aria-label="Table Columns"
								closeOnSelect={false}
								selectedKeys={visibleColumns}
								selectionMode="multiple"
								onSelectionChange={setVisibleColumns}
							>
								{columns.map((column) => (
									<DropdownItem key={column.uid} className="capitalize">
										{capitalize(column.name)}
									</DropdownItem>
								))}
							</DropdownMenu>
						</Dropdown>
						<Button
							className="bg-foreground text-background"
							endContent={<PlusIcon />}
							size="sm"
						>
							Add New
						</Button>
					</div>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-default-400 text-small">Total {users.length} users</span>
					<label className="flex items-center text-default-400 text-small">
						Rows per page:
						<select
							className="bg-transparent outline-none text-default-400 text-small"
							onChange={onRowsPerPageChange}
						>
							<option value="5">5</option>
							<option value="10">10</option>
							<option value="15">15</option>
						</select>
					</label>
				</div>
			</div>
		);
	}, [
		filterValue,
		statusFilter,
		visibleColumns,
		onSearchChange,
		onRowsPerPageChange,
		users.length,
		hasSearchFilter,
	]);

	const bottomContent = React.useMemo(() => {
		return (
			<div className="py-2 px-2 flex justify-between items-center">
				<Pagination
					showControls
					classNames={{
						cursor: 'bg-foreground text-background',
					}}
					color="default"
					isDisabled={hasSearchFilter}
					page={page}
					total={pages}
					variant="light"
					onChange={setPage}
				/>
				<span className="text-small text-default-400">
					{selectedKeys === 'all'
						? 'All items selected'
						: `${selectedKeys.size} of ${items.length} selected`}
				</span>
			</div>
		);
	}, [selectedKeys, items.length, page, pages, hasSearchFilter]);

	const classNames = React.useMemo(
		() => ({
			wrapper: ['max-h-[382px]', 'max-w-3xl'],
			th: ['bg-transparent', 'text-default-500', 'border-b', 'border-divider'],
			td: [
				// changing the rows border radius
				// first
				'group-data-[first=true]/tr:first:before:rounded-none',
				'group-data-[first=true]/tr:last:before:rounded-none',
				// middle
				'group-data-[middle=true]/tr:before:rounded-none',
				// last
				'group-data-[last=true]/tr:first:before:rounded-none',
				'group-data-[last=true]/tr:last:before:rounded-none',
			],
		}),
		[],
	);

	return (
		<>
			<h2 className='text-2xl font-bold'>Custom Style Table</h2>

			<Table
				isCompact
				removeWrapper
				aria-label="Example table with custom cells, pagination and sorting"
				bottomContent={bottomContent}
				bottomContentPlacement="outside"
				checkboxesProps={{
					classNames: {
						wrapper: 'after:bg-foreground after:text-background text-background',
					},
				}}
				classNames={classNames}
				selectedKeys={selectedKeys}
				selectionMode="multiple"
				sortDescriptor={sortDescriptor}
				topContent={topContent}
				topContentPlacement="outside"
				onSelectionChange={setSelectedKeys}
				onSortChange={setSortDescriptor}
			>
				<TableHeader columns={headerColumns}>
					{(column) => (
						<TableColumn
							key={column.uid}
							align={column.uid === 'actions' ? 'center' : 'start'}
							allowsSorting={column.sortable}
						>
							{column.name}
						</TableColumn>
					)}
				</TableHeader>
				<TableBody emptyContent={'No users found'} items={sortedItems}>
					{(item) => (
						<TableRow key={item.id}>
							{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
						</TableRow>
					)}
				</TableBody>
			</Table>
		</>
	);
}
