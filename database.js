import { Pool,PoolConfig } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'portal',
  password: 'admin',
  port: 5433,
});

export default pool;
