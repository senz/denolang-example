import { Ajv, mysql } from '../deps.ts';
import { EmployeeHierarchy, Employees } from 'src/types.ts';

const SCHEMA = {
	'$schema': 'http://json-schema.org/draft-07/schema#',
	type: 'object',
	'patternProperties': {
		'.*': { 'type': 'string' },
	},
	'additionalProperties': false,
};

const buildHierarchy = (relations: Employees): EmployeeHierarchy => {
	const subordinates: EmployeeHierarchy = {};

	for (const [employee, supervisor] of Object.entries(relations)) {
		if (!subordinates[employee]) {
			subordinates[employee] = {};
		}

		if (subordinates[supervisor]) {
			subordinates[supervisor][employee] = subordinates[employee];
		} else {
			subordinates[supervisor] = { [employee]: subordinates[employee] };
		}
	}

	for (const [_employee, supervisor] of Object.entries(relations)) {
		if (!relations[supervisor]) {
			return { [supervisor]: subordinates[supervisor] };
		}
	}

	return {};
};

export const handlerEmpFactory =
	(client: mysql.Client) => {
		const ajvinstance = new Ajv();
		const validate = ajvinstance.compile<Employees>(SCHEMA);

	return async (_request: Request): Promise<Response> => {
		const contentType = _request.headers.get('content-type');
		if (contentType?.toLocaleLowerCase() !== 'application/json') {
			return Promise.resolve(
				new Response('"bad request: contenttype"', {
					status: 400,
					headers: {
						'content-type': 'application/json',
					},
				}),
			);
		}

		let body: Employees | undefined;
		try {
			body = await JSON.parse(await _request.text()) as Employees;
		} catch (_e) {
			return Promise.resolve(
				new Response('"bad request: invalid json"', {
					status: 400,
					headers: {
						'content-type': 'application/json',
					},
				}),
			);
		}
		console.log(body);

		if (!validate(body)) {
			return Promise.resolve(
				new Response('"bad request: validation error"', {
					status: 400,
					headers: {
						'content-type': 'application/json',
					},
				}),
			);
		}

		const result = buildHierarchy(body);
		console.log(result);

		let id = 1;
		const nameToId: { [key: string]: number } = {};

		// Function to flatten the hierarchy and insert it into the database
		async function insertHierarchy(
			connection: mysql.Connection,
			supervisorId: number | null,
			hierarchy: EmployeeHierarchy,
		) {
			for (const name in hierarchy) {
				await connection.execute(
					`INSERT INTO employees(id, name, supervisor_id) values(?, ?, ?)`,
					[id, name, supervisorId],
				);
				nameToId[name] = id;
				id += 1;
				await insertHierarchy(
					connection,
					nameToId[name],
					hierarchy[name],
				);
			}
		}

		client.transaction(async (conn) => {
			await conn.execute('truncate table employees;');
			return await insertHierarchy(conn, null, result);
		});

		return Promise.resolve(
			new Response(JSON.stringify(result), {
				status: 201,
				headers: {
					'content-type': 'application/json',
				},
			}),
		);
	}
};

export const handlerSvFactory =
	(client: mysql.Client) => async (_request: Request): Promise<Response> => {
		const match = new URLPattern({ pathname: '/supervisors/:name/:levels' })
			.exec(_request.url);
		const groups = match?.pathname.groups;

		const res = await client.query(
			`    
  WITH RECURSIVE supervisor_cte AS (
      SELECT id, name, supervisor_id, 1 lvl
      FROM employees
      WHERE name = ?
      UNION ALL
      SELECT e.id, e.name, e.supervisor_id, lvl + 1
      FROM employees e
      INNER JOIN supervisor_cte scte ON e.id = scte.supervisor_id
  )
  SELECT name FROM supervisor_cte WHERE lvl BETWEEN 2 AND ? + 1;
  `,
			[groups?.name, groups?.levels],
		);

		console.log(res);

		return Promise.resolve(
			new Response(JSON.stringify(res), {
				status: 200,
				headers: {
					'content-type': 'application/json',
				},
			}),
		);
	};

export const okHandler = (_request: Request): Promise<Response> => {
	return Promise.resolve(
		new Response(JSON.stringify('ok'), {
			status: 200,
			headers: {
				'content-type': 'application/json',
			},
		}),
	);
};
