import { mysql } from '../deps.ts';
import { mock, snapshot } from '../test.deps.ts';
import { handlerEmpBuilder, handlerSvBuilder } from 'src/handlers.ts';
import { Employees } from './types.ts';

class MockClient extends mysql.Client {}

Deno.test('emp: invalid content type. 400', async function (t): Promise<void> {
	const r = new Request('http://localhost/employees', {
		body: '',
		method: 'POST',
		headers: {
			'content-type': 'ololopishpish',
		},
	});

	const client = new MockClient();

	const validate = (_data: Employees): boolean => {
		return true;
	};

	const res = await handlerEmpBuilder(validate, client)(r);
	const ress = {
		headers: res.headers,
		body: await res.text(),
		status: res.status,
	};

	snapshot.assertSnapshot(t, ress);
});

Deno.test('emp: invalid json. 400', async function (t): Promise<void> {
	const r = new Request('http://localhost/employees', {
		body: 'sdfds/dfdfds',
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
	});

	const client = new MockClient();

	const validate = (_data: Employees): boolean => {
		return true;
	};

	const res = await handlerEmpBuilder(validate, client)(r);
	const ress = {
		headers: res.headers,
		body: await res.text(),
		status: res.status,
	};
	snapshot.assertSnapshot(t, ress);
});

Deno.test('emp: malformed json. 400', async function (t): Promise<void> {
	const r = new Request('http://localhost/employees', {
		body: '{}',
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
	});

	const client = new MockClient();

	const validate = (_data: Employees): boolean => {
		return false;
	};

	const res = await handlerEmpBuilder(validate, client)(r);
	const ress = {
		headers: res.headers,
		body: await res.text(),
		status: res.status,
	};
	snapshot.assertSnapshot(t, ress);
});

Deno.test(
	'emp: valid json. stored in db. 201',
	async function (t): Promise<void> {
		const body = `
{
    "Pete": "Nick",
    "Barbara": "Nick",
    "Nick": "Sophie",
    "Sophie": "Jonas"
}
`;
		const r = new Request('http://localhost/employees', {
			body,
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
		});

		const client = new MockClient();
		const s = mock.stub(
			client,
			'execute',
			mock.resolvesNext([
				{ affectedRows: 5 }, // truncate
				{ affectedRows: 1 }, // inserts...
				{ affectedRows: 1 },
				{ affectedRows: 1 },
				{ affectedRows: 1 },
				{ affectedRows: 1 },
			]),
		);

		const validate = (_data: Employees): boolean => true;

		let res;
		try {
			res = await handlerEmpBuilder(validate, client)(r);
		} finally {
			s.restore();
		}

		const ress = {
			headers: res.headers,
			body: await res.text(),
			status: res.status,
		};
		snapshot.assertSnapshot(t, ress);
	},
);

Deno.test(
	'sv: 2 entries in db. array with elements returned. 200',
	async function (t): Promise<void> {
		const r = new Request('http://localhost/supervisors/Nick/2', {
			method: 'GET',
			headers: {},
		});

		const client = new MockClient();
		const s = mock.stub(
			client,
			'query',
			mock.resolvesNext([
				[
					{
						'name': 'Sophie',
					},
					{
						'name': 'Jonas',
					},
				],
			]),
		);

		let res;
		try {
			res = await handlerSvBuilder(client)(r);
		} finally {
			s.restore();
		}

		const ress = {
			headers: res.headers,
			body: await res.text(),
			status: res.status,
		};
		snapshot.assertSnapshot(t, ress);
	},
);
