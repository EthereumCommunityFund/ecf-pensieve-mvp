import Button from '@/components/base/button';
import Link from 'next/link';

const TablePage = () => {
	return (
		<div className="flex flex-col gap-2">
			<Link href="/table/hero-ui">
				<Button>HeroUI Table</Button>
			</Link>
			<Link href="/table/react-data-grid">
				<Button>React Data Grid</Button>
			</Link>
			<Link href="/table/tanstack-table">
				<Button>TanStack Table</Button>
			</Link>
			<Link href="/table/ag-grid">
				<Button>AgGrid</Button>
			</Link>
		</div>
	);
};

export default TablePage;
