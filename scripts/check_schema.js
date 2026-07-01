require('dotenv').config({path: '.env.local'});
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.SUPABASE_DATABASE_URL });
client.connect().then(() => {
  client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'coupons';").then(res => {
    console.log(res.rows);
    client.end();
  });
});
