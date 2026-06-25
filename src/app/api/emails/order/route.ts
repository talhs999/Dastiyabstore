import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { order, items } = await req.json();

    if (!order) {
      return NextResponse.json({ error: "Missing order details" }, { status: 400 });
    }

    // 1. Fetch SMTP settings from Supabase
    const { data: smtpData, error: smtpError } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "smtp_settings")
      .single();

    let smtpSettings = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
      user: process.env.SMTP_USER || "",
      password: process.env.SMTP_PASSWORD || "",
      senderName: process.env.SMTP_SENDER_NAME || "Dastiyab Store",
      adminEmail: process.env.SMTP_ADMIN_EMAIL || ""
    };

    if (!smtpError && smtpData && smtpData.value) {
      try {
        const parsed = typeof smtpData.value === "string" ? JSON.parse(smtpData.value) : smtpData.value;
        smtpSettings = { ...smtpSettings, ...parsed };
      } catch (e) {
        console.error("Error parsing SMTP settings from database:", e);
      }
    }

    // 1b. Fetch Payment settings from Supabase to send details dynamically
    const { data: paymentData } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "payment_settings")
      .single();

    let paymentSettings: any = null;
    if (paymentData && paymentData.value) {
      try {
        paymentSettings = typeof paymentData.value === "string" ? JSON.parse(paymentData.value) : paymentData.value;
      } catch (e) {
        console.error("Error parsing Payment settings from database:", e);
      }
    }

    // 2. Set up Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.host,
      port: Number(smtpSettings.port),
      secure: Number(smtpSettings.port) === 465,
      auth: {
        user: smtpSettings.user,
        pass: smtpSettings.password,
      },
    });

    // 3. Prepare the conditional payment warning note
    const manualPaymentMethods = ["Bank Transfer", "JazzCash", "EasyPaisa"];
    const paymentMethodClean = order.payment_method?.toLowerCase().replace(/\s+/g, "") || "";
    const isManualPayment = manualPaymentMethods.some(method => 
      paymentMethodClean === method.toLowerCase().replace(/\s+/g, "")
    );

    let paymentWarningNoteHtml = "";
    let paymentDetailsHtml = "";

    if (isManualPayment) {
      paymentWarningNoteHtml = `
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0; color: #b45309; font-family: sans-serif;">
          <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700;">⚠️ Payment Action Required</h4>
          <p style="margin: 0; font-size: 13px; line-height: 1.5;">
            Thank you for selecting <strong>${order.payment_method}</strong>. If you haven't made the payment yet, please transfer the amount to the details provided below to ensure prompt processing of your order.
          </p>
        </div>
      `;

      if (paymentSettings) {
        let details = null;
        let title = "";
        let bankRow = "";
        let ibanRow = "";

        if (paymentMethodClean === "banktransfer") {
          details = paymentSettings.bank?.details;
          title = "Bank Transfer details";
          if (details?.bankName) {
            bankRow = `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px;"><strong>Bank Name:</strong></td>
                <td style="padding: 8px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right;">${details.bankName}</td>
              </tr>
            `;
          }
          if (details?.iban) {
            ibanRow = `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 0; color: #6b7280; font-size: 13px;"><strong>IBAN:</strong></td>
                <td style="padding: 8px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right; user-select: all;">${details.iban}</td>
              </tr>
            `;
          }
        } else if (paymentMethodClean === "jazzcash") {
          details = paymentSettings.jazzcash?.details;
          title = "JazzCash details";
        } else if (paymentMethodClean === "easypaisa") {
          details = paymentSettings.easypaisa?.details;
          title = "EasyPaisa details";
        }

        if (details) {
          paymentDetailsHtml = `
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; margin: 20px 0; font-family: sans-serif; color: #166534;">
              <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; color: #14532d; text-transform: uppercase; letter-spacing: 0.5px;">${title}</h4>
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                ${bankRow}
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; color: #6b7280; font-size: 13px;"><strong>Account Name:</strong></td>
                  <td style="padding: 8px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right;">${details.accountName || ""}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; color: #6b7280; font-size: 13px;"><strong>Account/Mobile Number:</strong></td>
                  <td style="padding: 8px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right; user-select: all;">${details.accountNumber || ""}</td>
                </tr>
                ${ibanRow}
              </table>
              ${details.instructions ? `
                <p style="margin: 12px 0 0 0; font-size: 12px; color: #15803d; font-style: italic; line-height: 1.4;">
                  <strong>Instructions:</strong> ${details.instructions}
                </p>
              ` : ""}
            </div>
          `;
        }
      }
    }

    const orderRef = order.id ? order.id.split("-")[0].toUpperCase() : "";

    // 4. Build order items rows
    let itemsHtml = "";
    if (items && Array.isArray(items)) {
      items.forEach(item => {
        itemsHtml += `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px 0; vertical-align: middle;">
              <div style="display: flex; align-items: center;">
                ${item.product_image ? `<img src="${item.product_image}" alt="${item.product_name}" width="50" height="50" style="object-fit: contain; margin-right: 12px; border-radius: 4px; border: 1px solid #e5e7eb;" />` : ""}
                <div>
                  <div style="font-weight: 700; color: #1f2937; font-size: 14px;">${item.product_name}</div>
                  <div style="font-size: 12px; color: #6b7280;">Qty: ${item.quantity}</div>
                </div>
              </div>
            </td>
            <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #1f2937; font-size: 14px; vertical-align: middle;">
              Rs. ${(item.price * item.quantity).toLocaleString()}
            </td>
          </tr>
        `;
      });
    }

    // 5. Build HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Dastiyab Store</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td style="background-color: #111827; padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">DASTIYAB STORE</h1>
              <p style="color: #9ca3af; margin: 6px 0 0 0; font-size: 14px;">Your order confirmation & receipt</p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #111827;">Thank you for your order!</h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                Hi ${order.customer_name}, we've received your order and are getting it ready. You'll receive another update once it ships.
              </p>
              
              <div style="border-bottom: 2px solid #f3f4f6; padding-bottom: 12px; margin-bottom: 24px;">
                <span style="font-size: 12px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Order Reference</span>
                <div style="font-size: 18px; font-weight: 800; color: #111827; margin-top: 4px;">#${orderRef}</div>
              </div>

              ${paymentWarningNoteHtml}
              ${paymentDetailsHtml}

              <!-- Items Table -->
              <h3 style="font-size: 15px; font-weight: 800; color: #111827; margin: 24px 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Items Ordered</h3>
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
                ${itemsHtml}
              </table>

              <!-- Pricing Summary -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-top: 20px; font-size: 14px; color: #4b5563;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #1f2937;">Rs. ${order.subtotal?.toLocaleString()}</td>
                </tr>
                ${order.discount_amount ? `
                <tr>
                  <td style="padding: 6px 0; color: #16a34a;">Discount ${order.coupon_code ? `(${order.coupon_code})` : ""}</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #16a34a;">- Rs. ${order.discount_amount?.toLocaleString()}</td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Shipping</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #1f2937;">${order.shipping_fee === 0 ? "FREE" : `Rs. ${order.shipping_fee?.toLocaleString()}`}</td>
                </tr>
                <tr style="border-top: 2px solid #f3f4f6;">
                  <td style="padding: 16px 0 0 0; font-weight: 800; color: #111827; font-size: 16px;">Grand Total</td>
                  <td style="padding: 16px 0 0 0; text-align: right; font-weight: 900; color: #dc2626; font-size: 20px;">Rs. ${order.total_amount?.toLocaleString()}</td>
                </tr>
              </table>

              <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 24px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <tr>
                    <td width="50%" style="vertical-align: top; padding-right: 10px;">
                      <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Details</h4>
                      <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5; white-space: pre-wrap;">${order.shipping_address}</p>
                      <p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563; font-weight: 600;">Phone: ${order.customer_phone}</p>
                    </td>
                    <td width="50%" style="vertical-align: top; padding-left: 10px;">
                      <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</h4>
                      <p style="margin: 0; font-size: 14px; color: #dc2626; font-weight: 700;">${order.payment_method}</p>
                      ${order.order_notes ? `
                        <h4 style="margin: 12px 0 4px 0; font-size: 11px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Order Notes</h4>
                        <p style="margin: 0; font-size: 12px; color: #6b7280; font-style: italic;">${order.order_notes}</p>
                      ` : ""}
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <p style="margin: 0 0 8px 0;">Need help? Reply to this email or contact us at <a href="mailto:${smtpSettings.adminEmail}" style="color: #dc2626; text-decoration: none; font-weight: 600;">${smtpSettings.adminEmail}</a></p>
              <p style="margin: 0;">© ${new Date().getFullYear()} Dastiyab Store. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 6. Send email to the customer (if email is provided)
    if (order.customer_email) {
      await transporter.sendMail({
        from: `"${smtpSettings.senderName}" <${smtpSettings.user}>`,
        to: order.customer_email,
        subject: `Order Confirmation #${orderRef} - Dastiyab Store`,
        html: htmlContent,
      });
    }

    // 7. Send notification copy to the admin
    await transporter.sendMail({
      from: `"${smtpSettings.senderName}" <${smtpSettings.user}>`,
      to: smtpSettings.adminEmail,
      subject: `[New Order Alert] #${orderRef} - Rs. ${order.total_amount?.toLocaleString()}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">New Order Placed!</h2>
          <p>An order has been placed by <strong>${order.customer_name}</strong> (${order.customer_email || "No Email Address"}).</p>
          <table style="width:100%; border-collapse: collapse; font-size:14px; margin-bottom: 20px;">
            <tr>
              <td style="padding: 6px 0; color:#6b7280;"><strong>Order Ref:</strong></td>
              <td style="padding: 6px 0;">#${orderRef}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color:#6b7280;"><strong>Total Amount:</strong></td>
              <td style="padding: 6px 0; font-weight: bold; color: #dc2626;">Rs. ${order.total_amount?.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color:#6b7280;"><strong>Payment Method:</strong></td>
              <td style="padding: 6px 0;">${order.payment_method}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color:#6b7280;"><strong>Contact Phone:</strong></td>
              <td style="padding: 6px 0;">${order.customer_phone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color:#6b7280; vertical-align: top;"><strong>Shipping Address:</strong></td>
              <td style="padding: 6px 0;">${order.shipping_address}</td>
            </tr>
          </table>
          <p>Please check your Admin panel to process this order.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending order confirmation email:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
