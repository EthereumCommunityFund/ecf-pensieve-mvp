export interface SubRowData {
	id: number;
	name: string;
	age: number;
	city: string;
}

export interface Person {
	id: number;
	firstName: string;
	lastName: string;
	age: number;
	visits: number;
	status: string;
	progress: number;
	subRows?: SubRowData[];
}
