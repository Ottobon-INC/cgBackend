const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function applyPolicies() {
    try {
        console.log('[Policies] Applying public read policy to cg_components...');
        
        // 1. Ensure RLS is enabled (just in case)
        await pool.query('ALTER TABLE cg_components ENABLE ROW LEVEL SECURITY');
        
        // 2. Drop existing policy if it exists (for idempotency)
        await pool.query('DROP POLICY IF EXISTS "Enable read access for all users" ON cg_components');
        
        // 3. Create the policy
        await pool.query(`
            CREATE POLICY "Enable read access for all users" 
            ON public.cg_components 
            FOR SELECT 
            USING (true)
        `);
        
        console.log('[Policies] Success: Public read access enabled for cg_components.');
        
        // 4. List policies to verify
        const res = await pool.query("SELECT * FROM pg_policies WHERE tablename = 'cg_components'");
        console.log('--- Current RLS Policies ---');
        console.table(res.rows);
        
    } catch (err) {
        console.error('[Policies] Error:', err.message);
    } finally {
        await pool.end();
    }
}

applyPolicies();
