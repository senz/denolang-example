import { superdeno } from '../test.deps.ts';
import { mysql } from '../deps.ts';
import { createServer } from 'src/app.ts';

class MockClient extends mysql.Client {}
new MockClient()

const client = await new mysql.Client()
	.connect({
		hostname: '127.0.0.1',
		username: 'user',
		port: 3306,
		db: 'employees',
		password: 'my-secret-pw',
	});

const app = createServer(8080, client);


Deno.test('get ping. 200', async function () {
    await superdeno(app)
    .get('/ping')
    .expect('Content-Type', /json/)
    .expect(200);
});