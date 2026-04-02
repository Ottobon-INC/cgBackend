const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query('SELECT category, COUNT(*) as count FROM cg_components GROUP BY category');
        console.log('--- Component Counts by Category ---');
        res.rows.forEach(r => console.log(`${r.category}: ${r.count}`));
        
        const total = await pool.query('SELECT COUNT(*) FROM cg_components');
        console.log('Total Components:', total.rows[0].count);
        
        const firstFew = await pool.query('SELECT id, title, category FROM cg_components LIMIT 10');
        console.log('--- First 10 Components ---');
        console.table(firstFew.rows);
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
