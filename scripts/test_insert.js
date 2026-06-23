require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testInsert() {
  console.log("Testing insert...");
  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_name: "Test",
      customer_email: "test@test.com",
      customer_phone: "123",
      shipping_address: "123 Test",
      shipping_city: "Test City",
      order_notes: "",
      subtotal: 100,
      shipping_fee: 0,
      total_amount: 100,
      payment_method: 'COD',
      status: 'Pending'
    })
    .select()
    .single();

  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Insert successful:", data);
  }
}

testInsert();
