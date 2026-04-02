const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkPolicies() {
    try {
        const res = await pool.query("SELECT * FROM pg_policies WHERE tablename = 'cg_components'");
        console.log('--- Current RLS Policies for cg_components ---');
        console.table(res.rows);
        
        if (res.rows.length === 0) {
            console.log('No policies found. If RLS is enabled, columns might be hidden.');
        }
        
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkPolicies();
