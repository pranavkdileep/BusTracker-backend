import {Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionConfig = {
    user: process.env.PGSQL_USER,
    password: process.env.PGSQL_PASSWORD,
    host: process.env.PGSQL_HOST,
    port: parseInt(process.env.PGSQL_PORT!, 10),
    database: process.env.PGSQL_DATABASE,
    pool_mode: process.env.PGSQL_POOL_MODE,
};

export const connection = new Pool(connectionConfig);

connection.connect((err) => {
    if (err) {
        console.error('Connection error', err);
        console.log(connectionConfig);
    } else {
        console.log('Connected to the database');
    }
});