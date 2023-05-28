import { dotenv, mysql } from './deps.ts';
import { createServer } from 'src/app.ts';

dotenv.config({ export: true });
const { DB_HOST, DB_PASSWORD, DB_PORT, SERVER_PORT } = Deno.env.toObject();


const client = await new mysql.Client()
	.connect({
		hostname: DB_HOST,
		username: 'user',
		port: Number(DB_PORT),
		db: 'employees',
		password: DB_PASSWORD,
	});

const app = createServer(Number(SERVER_PORT), client);
app.listenAndServe();
