import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await client.connect();
  try {
    console.log('Renaming components to cg_components...');
    await client.query(`ALTER TABLE components RENAME TO cg_components;`);
    console.log('Successfully renamed components to cg_components.');

    console.log('Renaming component_likes to cg_component_likes...');
    await client.query(`ALTER TABLE component_likes RENAME TO cg_component_likes;`);
    console.log('Successfully renamed component_likes to cg_component_likes.');

  } catch (err: any) {
    if (err.message && err.message.includes('does not exist')) {
        console.error('Table does not exist. It might have already been renamed? Error:', err.message);
    } else {
        console.error('Migration error:', err);
    }
  } finally {
    await client.end();
  }
}
run();
