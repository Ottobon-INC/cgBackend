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
      SELECT 
          tc.table_schema, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_schema AS foreign_table_schema, 
          ccu.table_name AS foreign_table_name, 
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu 
            ON tc.constraint_name = kcu.constraint_name 
            AND tc.table_schema = kcu.table_schema 
          JOIN information_schema.constraint_column_usage AS ccu 
            ON ccu.constraint_name = tc.constraint_name 
            AND ccu.table_schema = tc.table_schema 
      WHERE 
          tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'cg_components';
    `);
    console.log('Foreign Keys for cg_components:', JSON.stringify(res.rows, null, 2));

  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    await client.end();
  }
}
run();
