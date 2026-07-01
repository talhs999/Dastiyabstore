require('dotenv').config({path: '.env.local'});
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.SUPABASE_DATABASE_URL });
client.connect().then(() => {
  client.query("ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_uses integer DEFAULT 0, ADD COLUMN IF NOT EXISTS used_count integer DEFAULT 0;").then(res => {
    console.log("Success");
    client.end();
  }).catch(err => {
    console.error(err);
    client.end();
  });
});
