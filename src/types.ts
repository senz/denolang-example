export interface Route {
	path: string;
	method: string;
	handler: HttpHandler;
	noauth?: boolean;
}

export interface Employees {
	[key: string]: string;
}

export interface EmployeeHierarchy {
	[key: string]: EmployeeHierarchy;
}

export type HttpHandler = (_request: Request) => Promise<Response>;
