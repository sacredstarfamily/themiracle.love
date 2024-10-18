import {Pool} from 'pg';

let conn; 
if(!conn){
conn = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
}
export default conn;
