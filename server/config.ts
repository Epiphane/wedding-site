import { DataSourceOptions } from "typeorm";
import dotenv from 'dotenv';

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
