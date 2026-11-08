import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Helper: fetch store SMTP config
async function getSmtpSettings() {
  const smtpSetting = await prisma.storeSetting.findUnique({
    where: { key: "smtp_settings" }
  });

  let smtpSettings = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    senderName: process.env.SMTP_SENDER_NAME || "Dastiyab Store",
    adminEmail: process.env.SMTP_ADMIN_EMAIL || ""
  };

  if (smtpSetting && smtpSetting.value) {
    try {
      const parsed = typeof smtpSetting.value === "string" ? JSON.parse(smtpSetting.value) : smtpSetting.value;
      smtpSettings = { ...smtpSettings, ...parsed };
    } catch (e) {
      console.error("Error parsing SMTP settings:", e);
    }
  }

  return smtpSettings;
}

// Generate high-converting branded HTML email
function getReminderEmailHtml(customerName: string) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>10% OFF at Dastiyab Store</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 30px 10px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
            
            <!-- Header Banner -->
            <tr>
              <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 36px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">
                  DASTIYAB STORE
                </h1>
                <p style="color: #fecaca; margin: 6px 0 0 0; font-size: 14px; font-weight: 500;">
                  Jo Chahiye, Wahi Dastiyab
                </p>
              </td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td style="padding: 36px 30px;">
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                  Assalam-o-Alaikum <strong>${customerName || "Customer"}</strong>,
                </p>
                
                <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                  Humne dekha ke aapne Dastiyab Store visit kiya tha! Trending fashion, winter night suits aur tech gadgets tezi se out-of-stock ho rahe hain.
                </p>

                <!-- Voucher Box -->
                <table role="presentation" width="100%" style="background-color: #fffbeb; border: 2px dashed #f59e0b; border-radius: 12px; margin: 24px 0;">
                  <tr>
                    <td style="padding: 24px; text-align: center;">
                      <span style="font-size: 13px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 1px;">
                        Special 10% OFF Voucher
                      </span>
                      <div style="font-size: 32px; font-weight: 900; color: #dc2626; letter-spacing: 2px; margin: 8px 0;">
                        WELCOME10
                      </div>
                      <p style="font-size: 13px; color: #92400e; margin: 0;">
                        Checkout par ye coupon code enter karein aur flat 10% discount payein!
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Features Bullets -->
                <table role="presentation" width="100%" style="margin: 24px 0;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #374151;">
                      🚚 <strong>Free Delivery</strong> on qualifying orders across Pakistan
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #374151;">
                      💵 <strong>Cash on Delivery (COD)</strong> available nationwide
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #374151;">
                      🔄 <strong>5-Day Easy Returns</strong> &amp; 100% Quality Guaranteed
                    </td>
                  </tr>
                </table>

                <!-- Action Button -->
                <div style="text-align: center; margin: 32px 0 20px 0;">
                  <a href="https://dastiyabstore.com/shop?coupon=WELCOME10" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 800; padding: 16px 36px; border-radius: 50px; box-shadow: 0 8px 20px rgba(220, 38, 38, 0.35);">
                    Shop Now &amp; Claim Discount &rarr;
                  </a>
                </div>

                <p style="font-size: 13px; color: #9ca3af; text-align: center; margin: 16px 0 0 0;">
                  Ye voucher agle 48 ghanto ke liye valid hai.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px 30px; text-align: center;">
                <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0;">
                  Need help with your order? WhatsApp us at <strong>+92 316 2975195</strong>
                </p>
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                  &copy; ${new Date().getFullYear()} Dastiyab Store. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

// GET or POST: Process abandoned reminders
export async function GET(req: Request) {
  return handleReminders(req);
}

export async function POST(req: Request) {
  return handleReminders(req);
}

async function handleReminders(req: Request) {
  try {
    const url = new URL(req.url);
    const isCron = url.searchParams.get("cron") === "1";

    let body: any = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch (_) {}
    }

    // Visitor registration from client
    if (body.action === "register_visitor") {
      return NextResponse.json({ success: true, message: "Visitor session acknowledged" });
    }

    // 1. Fetch SMTP settings
    const smtp = await getSmtpSettings();
    if (!smtp.user || !smtp.password) {
      return NextResponse.json({
        success: false,
        message: "SMTP is not configured in store settings yet"
      }, { status: 200 });
    }

    // 2. Query customers created in the last 48 hours
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const recentCustomers = await prisma.customer.findMany({
      where: {
        created_at: { gte: twoDaysAgo }
      },
      take: 50
    });

    if (recentCustomers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No recent customers found to evaluate",
        processed: 0,
        sent: 0
      });
    }

    // 3. Fetch all orders from recent customers to exclude purchasers
    const customerEmails = recentCustomers.map(c => c.email);
    const existingOrders = await prisma.order.findMany({
      where: {
        email: { in: customerEmails }
      },
      select: { email: true }
    });

    const orderedEmailSet = new Set(existingOrders.map(o => o.email?.toLowerCase()));

    // 4. Fetch past reminder logs from StoreSetting
    const logSetting = await prisma.storeSetting.findUnique({
      where: { key: "abandoned_email_logs" }
    });
    let logs: Record<string, { count: number; lastSentAt: number }> = {};
    if (logSetting && logSetting.value) {
      try {
        logs = typeof logSetting.value === "string" ? JSON.parse(logSetting.value) : (logSetting.value as any);
      } catch (_) {}
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port),
      secure: Number(smtp.port) === 465,
      auth: {
        user: smtp.user,
        pass: smtp.password
      }
    });

    let sentCount = 0;
    const now = Date.now();

    for (const customer of recentCustomers) {
      const emailLower = customer.email.toLowerCase();

      // Rule 1: Skip if customer has placed an order
      if (orderedEmailSet.has(emailLower)) continue;

      // Rule 2: Strictly limit to max 2 emails over 2 days
      const customerLog = logs[emailLower] || { count: 0, lastSentAt: 0 };
      if (customerLog.count >= 2) continue;

      // Rule 3: Spacing between emails (at least 20 hours)
      if (customerLog.lastSentAt && (now - customerLog.lastSentAt) < 20 * 60 * 60 * 1000) {
        continue;
      }

      try {
        await transporter.sendMail({
          from: `"${smtp.senderName}" <${smtp.user}>`,
          to: customer.email,
          subject: "🎁 Your 10% OFF Voucher Inside — Complete Your Order at Dastiyab Store",
          html: getReminderEmailHtml(customer.name || "Customer")
        });

        logs[emailLower] = {
          count: customerLog.count + 1,
          lastSentAt: now
        };
        sentCount++;
      } catch (sendErr) {
        console.error(`Failed to send reminder to ${customer.email}:`, sendErr);
      }
    }

    // Save updated logs to database
    if (sentCount > 0) {
      await prisma.storeSetting.upsert({
        where: { key: "abandoned_email_logs" },
        update: { value: logs },
        create: { key: "abandoned_email_logs", value: logs }
      });
    }

    return NextResponse.json({
      success: true,
      processed: recentCustomers.length,
      sent: sentCount
    });
  } catch (error: any) {
    console.error("Error in abandoned reminder job:", error);
    return NextResponse.json({ error: error.message || "Failed to process reminders" }, { status: 500 });
  }
}
