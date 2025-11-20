import { DataSourceOptions } from "typeorm";

export const development = {
    type: "sqlite",
    database: 'wedding-site.db',
    synchronize: true,
    logging: ['info', 'error'],
} as DataSourceOptions;

export const production = {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "root",
    password: "admin",
    database: "wedding-site",
    synchronize: false,
    logging: false,
} as DataSourceOptions;

export default {
    development, production,
}
