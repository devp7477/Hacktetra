import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { log } from '../utils';

async function main() {
  if (!process.env.DIRECT_URL) {
    throw new Error('DIRECT_URL environment variable is required');
  }

  log('Connecting to database...');
  const pool = new Pool({ connectionString: process.env.DIRECT_URL });

  try {
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'create-tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    log('Executing SQL script...');
    await pool.query(sql);

    log('SQL script executed successfully');
  } catch (error) {
    console.error('Error executing SQL:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
