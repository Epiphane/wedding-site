import { DataSourceOptions } from "typeorm";
import dotenv from 'dotenv';
import PostgressConnectionStringParser from "pg-connection-string";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

dotenv.config();

type EnvTypes = 'dev' | 'prod';

const dbConfigs: { [K in EnvTypes]: DataSourceOptions } = {
	dev: {
		type: "sqlite",
		database: 'wedding-site.db',
		synchronize: true,
		logging: ['info', 'error'],
	},
	prod: {
		type: "postgres",
		host: "localhost",
		port: 5432,
		username: "root",
		password: "admin",
		database: "wedding-site",
		synchronize: false,
		logging: false,
	},
}

if (process.env.DATABASE_URL) {
	const databaseUrl: string = process.env.DATABASE_URL;
	const connectionOptions = PostgressConnectionStringParser.parse(databaseUrl);
	const typeOrmOptions: PostgresConnectionOptions = {
		type: "postgres",
		host: connectionOptions.host || undefined,
		port: +(connectionOptions.port || 0),
		username: connectionOptions.user,
		password: connectionOptions.password,
		database: connectionOptions.database || undefined,
		synchronize: true,
		ssl: {
			rejectUnauthorized: false,
		},
		extra: {
			ssl: true,
		}
	};
	dbConfigs.prod = typeOrmOptions;
}

let env: EnvTypes = 'dev';
if (process.env.NODE_ENV === 'prod') {
	env = process.env.NODE_ENV;
}

export default {
	env,
	port: process.env.PORT || 3001,
	database: dbConfigs[env],
	adminPassword: process.env.ADMIN_PASSWORD || 'thomas',
};
