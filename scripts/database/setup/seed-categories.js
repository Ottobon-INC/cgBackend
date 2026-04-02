const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const seed = [
    { id: 'forms', label: 'Forms', icon: '▣' },
    { id: 'navigation', label: 'Navigation', icon: '▷' },
    { id: 'data-display', label: 'Data Display', icon: '▤' },
    { id: 'overlays', label: 'Overlays', icon: '◫' },
    { id: 'feedback', label: 'Feedback', icon: '◌' },
];

async function seedCategories() {
    console.log('[Seed] Seeding categories into cg_categories...');
    try {
        for (const c of seed) {
            await pool.query(
                `INSERT INTO cg_categories (id, label, icon) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
                [c.id, c.label, c.icon]
            );
        }
        console.log('[Seed] Success: Categories seeded.');
    } catch (err) {
        console.error('[Seed] Error seeding categories:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seedCategories();
