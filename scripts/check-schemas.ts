import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await client.connect();
  try {
    const res = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'cg_components';
    `);
    console.log('Schemas containing cg_components:', JSON.stringify(res.rows, null, 2));

  } catch (err) {
    console.error('Error checking schemas:', err);
  } finally {
    await client.end();
  }
}
run();
