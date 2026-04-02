const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function listViews() {
    try {
        const res = await pool.query(`
            SELECT table_name, view_definition 
            FROM information_schema.views 
            WHERE table_schema = 'public'
        `);
        console.log('--- Views in Public Schema ---');
        console.table(res.rows);
        
        if (res.rows.length === 0) {
            console.log('No views found in the public schema.');
        }
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

listViews();
