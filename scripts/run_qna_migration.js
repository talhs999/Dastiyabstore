require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.SUPABASE_DATABASE_URL;

if (!connectionString) {
  console.error("SUPABASE_DATABASE_URL is not set in .env.local");
  process.exit(1);
}

async function runMigration() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Connected to database successfully!");

    const sqlPath = path.join(__dirname, 'create_qna_table.sql');
    console.log(`Reading SQL file from: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Executing SQL...");
    await client.query(sql);
    console.log("SQL executed successfully! product_qna table created.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();
