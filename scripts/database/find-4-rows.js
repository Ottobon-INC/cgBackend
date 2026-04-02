const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function findTablesWith4Rows() {
    try {
        const res = await pool.query(`
            SELECT schemaname, relname, n_live_tup 
            FROM pg_stat_user_tables 
            WHERE n_live_tup = 4
        `);
        console.log('--- Tables with 4 rows ---');
        console.table(res.rows);
        
        if (res.rows.length === 0) {
            console.log('No tables found with exactly 4 rows.');
        }
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

findTablesWith4Rows();
