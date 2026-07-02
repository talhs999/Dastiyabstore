import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { created_at: 'desc' }
    });

    const formattedOrders = orders.map(o => ({
      ...o,
      customer_name: [o.first_name, o.last_name].filter(Boolean).join(' ') || 'Guest',
      customer_email: o.email,
      customer_phone: o.phone,
      total_amount: o.total || 0,
      subtotal: o.total || 0,
      shipping_fee: 0,
      shipping_address: o.address || '',
      shipping_city: o.city || '',
      order_items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])
    }));

    return NextResponse.json(formattedOrders);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { ids, status } = await request.json();
    
    if (!ids || !status) {
      return NextResponse.json({ error: 'IDs and status are required' }, { status: 400 });
    }

    const idArray = Array.isArray(ids) ? ids : [ids];

    await prisma.order.updateMany({
      where: { id: { in: idArray } },
      data: { status }
    });

    if (status === "SHIPPED") {
      const nodemailer = require("nodemailer");
      const orders = await prisma.order.findMany({
        where: { id: { in: idArray } }
      });

      const smtpSetting = await prisma.storeSetting.findUnique({
        where: { key: "smtp_settings" }
      });

      if (smtpSetting && smtpSetting.value) {
        let smtpSettings: any = null;
        try {
          smtpSettings = typeof smtpSetting.value === "string" ? JSON.parse(smtpSetting.value) : smtpSetting.value;
        } catch (e) {
          console.error("Error parsing SMTP settings:", e);
        }

        if (smtpSettings && smtpSettings.host) {
          const transporter = nodemailer.createTransport({
            host: smtpSettings.host,
            port: Number(smtpSettings.port),
            secure: Number(smtpSettings.port) === 465,
            auth: {
              user: smtpSettings.user,
              pass: smtpSettings.password,
            },
          });

          for (const order of orders) {
            if (order.email) {
              const trackingUrl = `https://dastiyabstore.com/track-order`;
              
              const mailOptions = {
                from: `"${smtpSettings.fromName || 'Dastiyab Store'}" <${smtpSettings.fromEmail || smtpSettings.user}>`,
                to: order.email,
                subject: `Your Order #${order.id.slice(0,8)} has been Shipped! 🚚`,
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px;">
                    <h2 style="color: #e53e3e;">Great news, ${order.first_name || 'Customer'}!</h2>
                    <p>Your order <strong>#${order.id}</strong> has been shipped and is on its way to you.</p>
                    <p>You can track your order status at any time by visiting our tracking page and entering your order number:</p>
                    <div style="margin: 30px 0;">
                      <a href="${trackingUrl}" style="background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Your Order</a>
                    </div>
                    <p>If you have any questions or need further assistance, please feel free to contact us.</p>
                    <p>Best regards,<br><strong>Dastiyab Store Team</strong></p>
                  </div>
                `
              };
              
              try {
                await transporter.sendMail(mailOptions);
              } catch (err) {
                console.error("Failed to send shipped email for order", order.id, err);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) return NextResponse.json({ error: 'IDs are required' }, { status: 400 });

    const ids = idsParam.split(',');

    // Order items are stored as JSON on the Order model, so they are deleted automatically when the order is deleted.
    await prisma.order.deleteMany({
      where: { id: { in: ids } }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
