const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function applySchema() {
    console.log('[Schema] Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[Schema] Applying schema to database...');
    try {
        await pool.query(schemaSql);
        console.log('[Schema] Success: Database schema applied.');
    } catch (err) {
        console.error('[Schema] Error applying schema:', err.message);
        if (err.detail) console.error('[Schema] Detail:', err.detail);
        if (err.hint) console.error('[Schema] Hint:', err.hint);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

applySchema();
