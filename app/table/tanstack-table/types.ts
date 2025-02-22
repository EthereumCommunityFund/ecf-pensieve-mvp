export interface ProjectPlan {
	id: string;
	property: string;
	input: string;
	reference: string;
	submitter: {
		address: string;
		time: string;
	};
	subRows?: ProjectPlan[];
}
