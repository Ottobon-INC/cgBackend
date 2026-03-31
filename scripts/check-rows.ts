import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await client.connect();
  try {
    const res = await client.query(`SELECT count(*) FROM cg_components`);
    console.log('Total rows in cg_components:', res.rows[0].count);

    const all = await client.query(`SELECT title, created_at FROM cg_components ORDER BY created_at DESC`);
    console.log('All entries in cg_components (sorted by date):', JSON.stringify(all.rows, null, 2));

    const checkLikes = await client.query("SELECT count(*) FROM cg_component_likes");
    console.log('Total rows in cg_component_likes:', checkLikes.rows[0].count);

  } catch (err) {
    console.error('Error querying:', err);
  } finally {
    await client.end();
  }
}
run();
