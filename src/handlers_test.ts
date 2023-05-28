import { mysql } from '../deps.ts';
import { mock, snapshot } from '../test.deps.ts';
import { handlerEmpFactory, handlerSvFactory } from 'src/handlers.ts';

class MockClient extends mysql.Client {}

Deno.test('emp: invalid content type. 400', async function (t): Promise<void> {
	const r = new Request('http://localhost/employees', {
		body: JSON.stringify({'test': 'toast'}),
		method: 'POST',
		headers: {
			'content-type': 'ololopishpish',
		},
	});

	const client = new MockClient();

	const res = await handlerEmpFactory(client)(r);
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

	const res = await handlerEmpFactory(client)(r);
	const ress = {
		headers: res.headers,
		body: await res.text(),
		status: res.status,
	};
	snapshot.assertSnapshot(t, ress);
});

Deno.test('emp: malformed json. 400', async function (t): Promise<void> {
	const r = new Request('http://localhost/employees', {
		body: '{"test": 1}',
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
	});

	const client = new MockClient();
	const stubT = mock.stub(
		client,
		'transaction',
		mock.resolvesNext([{ affectedRows: 0 }])
	)

	let res;

	try {
		res = await handlerEmpFactory(client)(r);
	} finally {
		stubT.restore();
	}

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
		const stubT = mock.stub(
			client,
			'transaction',
			mock.resolvesNext([{ affectedRows: 0 }])
		);

		let res;
		try {
			res = await handlerEmpFactory(client)(r);
		} finally {
			stubT.restore();
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
			res = await handlerSvFactory(client)(r);
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
