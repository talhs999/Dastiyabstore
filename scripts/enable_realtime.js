const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function enableRealtime() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    try {
      await client.query(`alter publication supabase_realtime add table active_visitors;`);
      console.log('Realtime successfully enabled for active_visitors table!');
    } catch (e2) {
      if (e2.message.includes('already exists') || e2.message.includes('already part of')) {
        console.log('Table is already in publication.');
      } else {
        console.error('Error enabling realtime:', e2.message);
      }
    }
  } catch (error) {
    console.error('Connection error:', error.message);
  } finally {
    await client.end();
  }
}

enableRealtime();
