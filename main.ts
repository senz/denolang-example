import { Ajv, dotenv, http, mysql, scryptBasicAuth } from './deps.ts';
import { Employees, Route } from 'src/types.ts';
import {
	handlerEmpBuilder,
	handlerSvBuilder,
	okHandler,
} from 'src/handlers.ts';

dotenv.config({ export: true });
const { DB_HOST, DB_PASSWORD, DB_PORT, SERVER_PORT } = Deno.env.toObject();

const SCHEMA = {
	'$schema': 'http://json-schema.org/draft-07/schema#',
	type: 'object',
	'patternProperties': {
		'.*': { 'type': 'string' },
	},
	'additionalProperties': false,
};

const client = await new mysql.Client()
	.connect({
		hostname: DB_HOST,
		username: 'user',
		port: Number(DB_PORT),
		db: 'employees',
		password: DB_PASSWORD,
	});
const ajvinstance = new Ajv();
const validate = ajvinstance.compile<Employees>(SCHEMA);

const ROUTER: Route[] = [
	{
		'path': '/employees',
		'method': 'post',
		'handler': handlerEmpBuilder(validate, client),
	},
	{
		'path': '/supervisors/:name/:levels',
		'method': 'get',
		'handler': handlerSvBuilder(client),
	},
	{
		'path': '/ping',
		'method': 'get',
		'handler': okHandler,
		'noauth': true,
	},
];

const handler = async (_request: Request): Promise<Response> => {
	for (const route of ROUTER) {
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

http.serve(handler, { port: Number(SERVER_PORT) });
