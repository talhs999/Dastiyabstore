require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testUuidRange() {
  console.log("Testing UUID range query...");
  
  // 1. Fetch any order to get a valid UUID
  const { data: firstOrder, error: firstError } = await supabase
    .from('orders')
    .select('id')
    .limit(1);

  if (firstError) {
    console.error("Error fetching first order:", firstError);
    return;
  }

  if (!firstOrder || firstOrder.length === 0) {
    console.log("No orders found to test with.");
    return;
  }

  const fullId = firstOrder[0].id;
  const shortId = fullId.split("-")[0].toLowerCase();
  console.log(`Testing with full ID: ${fullId} -> short ID: ${shortId}`);

  // 2. Perform range query
  const lowerBound = `${shortId}-0000-0000-0000-000000000000`;
  const upperBound = `${shortId}-ffff-ffff-ffff-ffffffffffff`;

  const { data: matchedOrder, error: rangeError } = await supabase
    .from('orders')
    .select('*')
    .gte('id', lowerBound)
    .lte('id', upperBound);

  if (rangeError) {
    console.error("Range query failed:", rangeError);
  } else {
    console.log("Range query succeeded! Found orders count:", matchedOrder.length);
    if (matchedOrder.length > 0) {
      console.log("Matched ID:", matchedOrder[0].id);
    }
  }
}

testUuidRange();
