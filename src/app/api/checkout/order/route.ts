import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { order: orderData, items } = await request.json();

    // Fetch buying costs for all items to snapshot them
    const productIds = items.map((item: any) => item.product_id).filter(Boolean);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, buying_cost: true }
    });

    const productsMap = new Map(dbProducts.map(p => [p.id, p.buying_cost]));

    const enrichedItems = items.map((item: any) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      price: item.price,
      quantity: item.quantity,
      color: item.color,
      colorHex: item.colorHex,
      size: item.size,
      buying_cost: item.product_id ? (productsMap.get(item.product_id) || 0) : 0,
      store_id: item.store_id && item.store_id !== "dastiyab" ? item.store_id : null
    }));

    // Group items by store_id
    const storeGroups: Record<string, typeof enrichedItems> = {};
    enrichedItems.forEach((item: any) => {
      const sId = item.store_id || "dastiyab";
      if (!storeGroups[sId]) storeGroups[sId] = [];
      storeGroups[sId].push(item);
    });

    // Create an order for each store
    const createdOrders = [];

    // Verify coupon to know if it's store-specific
    let couponStoreId: string | null = null;
    let couponDiscountType: string | null = null;
    let couponDiscountValue = 0;
    if (orderData.coupon_code) {
      const dbCoupon = await prisma.coupon.findUnique({ where: { code: orderData.coupon_code }});
      if (dbCoupon) {
        couponStoreId = dbCoupon.store_id;
        couponDiscountType = dbCoupon.discount_type;
        couponDiscountValue = dbCoupon.discount_value;
      }
    }

    const globalSubtotal = enrichedItems.reduce((acc: number, cur: any) => acc + (cur.price * cur.quantity), 0);

    for (const [storeId, storeItems] of Object.entries(storeGroups)) {
      const storeSubtotal = storeItems.reduce((acc: number, cur: any) => acc + (cur.price * cur.quantity), 0);
      
      const storeShipping = Math.round((storeSubtotal / globalSubtotal) * orderData.shipping_fee);
      
      let storeDiscount = 0;
      if (orderData.coupon_code) {
        if (couponStoreId) {
          // Vendor coupon - only applies to the vendor's order
          if (storeId === couponStoreId) {
            storeDiscount = couponDiscountType === "percentage" 
              ? Math.round(storeSubtotal * (couponDiscountValue / 100)) 
              : Math.min(couponDiscountValue, storeSubtotal);
          }
        } else {
          // Global coupon - pro-rate across all stores
          storeDiscount = Math.round((storeSubtotal / globalSubtotal) * (orderData.discount_amount || 0));
        }
      }

      const storeTotal = storeSubtotal + storeShipping - storeDiscount;

      const newOrder = await prisma.order.create({
        data: {
          store_id: storeId === "dastiyab" ? null : storeId,
          first_name: orderData.customer_name,
          email: orderData.customer_email,
          phone: orderData.customer_phone,
          address: typeof orderData.shipping_address === 'string' ? orderData.shipping_address : JSON.stringify(orderData.shipping_address),
          city: orderData.shipping_city,
          total: storeTotal,
          payment_method: orderData.payment_method,
          status: orderData.status,
          subtotal: storeSubtotal,
          shipping_fee: storeShipping,
          discount_amount: storeDiscount,
          coupon_code: orderData.coupon_code,
          order_notes: orderData.order_notes,
          items: storeItems.map(({ store_id, ...rest }: any) => rest) // remove store_id from item json
        }
      });
      createdOrders.push(newOrder);

      // Trigger email for this specific order
      try {
        const baseUrl = request.headers.get("origin") || "http://localhost:3000";
        fetch(`${baseUrl}/api/emails/order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newOrder, items: storeItems })
        }).catch(e => console.error("Email API trigger failed for order", newOrder.id, e));
      } catch (e) {
        console.error("Failed to trigger email fetch", e);
      }
    }

    // Return the first order so the frontend can redirect to success page
    return NextResponse.json(createdOrders[0]);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
