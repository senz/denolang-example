import { http, mysql, scryptBasicAuth } from '../deps.ts';
import { Route } from 'src/types.ts';
import {
	handlerEmpFactory,
	handlerSvFactory,
	okHandler,
} from 'src/handlers.ts';

const createRouter = (
	client: mysql.Client
): Route[] => {
	return [
		{
			'path': '/employees',
			'method': 'post',
			'handler': handlerEmpFactory(client),
		},
		{
			'path': '/supervisors/:name/:levels',
			'method': 'get',
			'handler': handlerSvFactory(client),
		},
		{
			'path': '/ping',
			'method': 'get',
			'handler': okHandler,
			'noauth': true,
		},
	];
};

const handlerFactory = (
	client: mysql.Client
): http.Handler => {
	const router = createRouter(client);

	return async (_request: Request): Promise<Response> => {
		for (const route of router) {
			const { path, method, handler } = route;
			const pathPattern = new URLPattern({ pathname: path });
			if (
				_request.method === method.toUpperCase() &&
				pathPattern.test(_request.url)
			) {
				if (!route.noauth) {
					const response = await scryptBasicAuth(_request);
					if (!response.ok) {
						return response;
					}
				}

				try {
					return handler(_request);
				} catch (e) {
					console.error(e);
					return Promise.resolve(
						new Response('"exception"', {
							status: 500,
							headers: {
								'content-type': 'application/json',
							},
						}),
					);
				}
			}
		}

		return Promise.resolve(
			new Response('"not found"', {
				status: 404,
				headers: {
					'content-type': 'application/json',
				},
			}),
		);
	};
};

export const createServer = (
	port: number,
	client: mysql.Client,
) => new http.Server({ port, handler: handlerFactory(client) });
