import {Pool} from 'pg';
import { pool } from './db';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSORD,
  port: process.env.DB_PORT,
});

module.exports = pool;
