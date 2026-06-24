require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkOrdersSchema() {
  console.log("Checking orders table columns...");
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error querying orders:", error);
  } else if (data && data.length > 0) {
    console.log("Returned columns from orders:", Object.keys(data[0]));
  } else {
    console.log("Table exists but is empty. Let's insert a test order to see returning fields.");
    const { data: testData, error: insertError } = await supabase
      .from('orders')
      .insert({
        customer_name: "Test Schema Check",
        customer_phone: "123",
        shipping_address: "Address Check",
        shipping_city: "City Check",
        subtotal: 10,
        shipping_fee: 0,
        total_amount: 10,
        payment_method: 'COD',
        status: 'Pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting test order:", insertError);
    } else {
      console.log("Test order inserted. Returned columns:", Object.keys(testData));
      // Delete it
      await supabase.from('orders').delete().eq('id', testData.id);
    }
  }
}

checkOrdersSchema();
