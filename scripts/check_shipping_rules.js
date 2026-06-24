require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkShippingRules() {
  console.log("Checking shipping_rules table...");
  const { data, error } = await supabase
    .from('shipping_rules')
    .select('*');

  if (error) {
    console.error("Error fetching shipping_rules:", error);
    console.log("This might mean the table does not exist or is empty.");
  } else {
    console.log("Table exists! Found rules:", JSON.stringify(data, null, 2));
  }
}

checkShippingRules();
