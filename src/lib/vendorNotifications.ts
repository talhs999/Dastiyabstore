import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

// Get base URL for email links
function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return "https://dastiyabstore.com";
}

// Fetch configured SMTP transporter
async function getTransporter() {
  const smtpSetting = await prisma.storeSetting.findUnique({
    where: { key: "smtp_settings" }
  });

  let config = {
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
    user: process.env.SMTP_USER || "support@dastiyabstore.com",
    password: process.env.SMTP_PASSWORD || "Dastiyab@support.com12",
    senderName: process.env.SMTP_SENDER_NAME || "Dastiyab Store",
    adminEmail: process.env.SMTP_ADMIN_EMAIL || "support@dastiyabstore.com"
  };

  if (smtpSetting && smtpSetting.value) {
    try {
      const parsed = typeof smtpSetting.value === "string" ? JSON.parse(smtpSetting.value) : smtpSetting.value;
      config = { ...config, ...parsed };
    } catch (e) {
      console.error("Error parsing SMTP settings:", e);
    }
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: Number(config.port),
    secure: Number(config.port) === 465,
    auth: {
      user: config.user,
      pass: config.password
    }
  });

  return { transporter, config };
}

/**
 * 1. Profile Update Notification Email (Name & Address)
 * Sent to existing vendors to update their owner name, phone & business address.
 */
export async function sendVendorProfileUpdateEmail(vendor: {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
}) {
  const { transporter, config } = await getTransporter();
  const baseUrl = getBaseUrl();
  const settingsUrl = `${baseUrl}/vendor/settings`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Please Update Your Vendor Profile</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 32px 28px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Dastiyab Store</h1>
      <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; font-weight: 500;">Vendor Partner Portal — Official Notification</p>
    </div>

    <!-- Body Content -->
    <div style="padding: 36px 32px;">
      <div style="display: inline-block; background: #fef2f2; color: #dc2626; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; border: 1px solid #fee2e2;">
        ACTION REQUIRED
      </div>

      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
        Please Update Your Vendor Name & Address
      </h2>

      <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
        Assalam-o-Alaikum <strong>${vendor.ownerName || vendor.storeName}</strong>,
      </p>

      <p style="font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 24px;">
        To ensure smooth order deliveries, accurate delivery rider pick-up dispatch, and complete vendor verification on <strong>Dastiyab Store</strong>, we request you to please update your vendor profile details.
      </p>

      <!-- Details Box -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 28px;">
        <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Information to update in your Vendor Dashboard:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
          <li><strong>Full Owner / Contact Name:</strong> Your official contact name</li>
          <li><strong>Active Phone Number:</strong> Direct number for delivery rider & dispatch calls</li>
          <li><strong>Pickup / Business Address:</strong> Complete location for parcel pickups</li>
          <li><strong>City:</strong> Your store dispatch city</li>
        </ul>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${settingsUrl}" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);">
          Update Vendor Profile Now &rarr;
        </a>
      </div>

      <!-- Security Notice -->
      <div style="background: #fffbeb; border-radius: 10px; padding: 14px 18px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
        <p style="font-size: 12px; line-height: 1.6; color: #92400e; margin: 0;">
          <strong>🔒 Security Note:</strong> For security reasons, your login email (<code>${vendor.email}</code>) and login password cannot be modified from the vendor dashboard. Only Dastiyab Store Admin can change login credentials.
        </p>
      </div>

      <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.6;">
        If you have any questions or need help updating your profile, reply directly to this email or contact Dastiyab Store Admin support.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f1f5f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
      &copy; ${new Date().getFullYear()} Dastiyab Store — Jo Chahiye, Wahi Dastiyab. All rights reserved.
    </div>

  </div>
</body>
</html>
  `;

  return await transporter.sendMail({
    from: `"${config.senderName}" <${config.user}>`,
    to: vendor.email,
    subject: `Action Required: Please update your Name and Address — Dastiyab Store`,
    html,
    text: `Assalam-o-Alaikum ${vendor.ownerName || vendor.storeName},\n\nPlease log in to your Dastiyab Store Vendor Dashboard at ${settingsUrl} and update your Full Name, Phone Number, and Pickup Address.\n\nNote: Login email and password can only be updated by Admin.\n\nRegards,\nDastiyab Store Team`
  });
}

/**
 * 2. Vendor Store SMTP Configuration Notification Email
 * Educates and prompts vendor to configure their own SMTP settings.
 */
export async function sendVendorSmtpSetupEmail(vendor: {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
}) {
  const { transporter, config } = await getTransporter();
  const baseUrl = getBaseUrl();
  const settingsUrl = `${baseUrl}/vendor/settings`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Configure Your Store SMTP Email Settings</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 28px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Dastiyab Store</h1>
      <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; font-weight: 500;">Store Email Notification System (SMTP)</p>
    </div>

    <!-- Body Content -->
    <div style="padding: 36px 32px;">
      <div style="display: inline-block; background: #eff6ff; color: #2563eb; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; border: 1px solid #dbeafe;">
        EMAIL NOTIFICATIONS SETUP
      </div>

      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
        Receive Instant Order Notifications Directly in Your Email
      </h2>

      <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
        Hello <strong>${vendor.ownerName || vendor.storeName}</strong>,
      </p>

      <p style="font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 24px;">
        Did you know you can receive instant order alerts straight to your personal or business email inbox whenever a customer places an order from your store on <strong>Dastiyab Store</strong>?
      </p>

      <!-- Why Setup Box -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;">Why configure your Store SMTP?</h3>
        <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
          <li>⚡ <strong>Real-time order alerts:</strong> Never miss a customer order</li>
          <li>📦 <strong>Customer invoice copies:</strong> Auto-deliver invoices to your email</li>
          <li>🔒 <strong>Personalized sender:</strong> Send order updates using your store brand</li>
        </ul>
      </div>

      <!-- Quick Steps -->
      <div style="background: #eff6ff; border-radius: 12px; padding: 18px 20px; border: 1px solid #bfdbfe; margin-bottom: 28px;">
        <h3 style="font-size: 14px; font-weight: 700; color: #1e40af; margin: 0 0 8px 0;">How to configure in 2 minutes:</h3>
        <ol style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 13px; line-height: 1.8;">
          <li>Log in to your Vendor Dashboard</li>
          <li>Go to <strong>Settings</strong> &rarr; scroll to <strong>Email Notification Settings (SMTP)</strong></li>
          <li>Enter your Host (e.g. <code>smtp.gmail.com</code>), Port (<code>465</code> or <code>587</code>), Email & Password</li>
          <li>Click <strong>Save Settings</strong></li>
        </ol>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${settingsUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.35);">
          Configure SMTP in Settings &rarr;
        </a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.6;">
        Need assistance setting up a Gmail App Password or custom domain SMTP? Reach out to Dastiyab Store Admin support anytime.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f1f5f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
      &copy; ${new Date().getFullYear()} Dastiyab Store — Jo Chahiye, Wahi Dastiyab. All rights reserved.
    </div>

  </div>
</body>
</html>
  `;

  return await transporter.sendMail({
    from: `"${config.senderName}" <${config.user}>`,
    to: vendor.email,
    subject: `Important: Configure your Store SMTP Email Settings — Dastiyab Store`,
    html,
    text: `Hello ${vendor.ownerName || vendor.storeName},\n\nPlease configure your Store SMTP Email Settings in your Dastiyab Store Vendor Dashboard at ${settingsUrl} to receive real-time order alerts directly to your inbox.\n\nRegards,\nDastiyab Store Team`
  });
}

/**
 * 3. 5-Day New Vendor Reminder Email
 * Automatically sent to new stores after 5 days if SMTP has not yet been set up.
 */
export async function sendVendor5DayReminderEmail(vendor: {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  daysActive: number;
}) {
  const { transporter, config } = await getTransporter();
  const baseUrl = getBaseUrl();
  const settingsUrl = `${baseUrl}/vendor/settings`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Day 5 Reminder: Set up your Order Notifications</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px 28px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Dastiyab Store</h1>
      <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.95; font-weight: 500;">Store Onboarding Follow-Up</p>
    </div>

    <!-- Body Content -->
    <div style="padding: 36px 32px;">
      <div style="display: inline-block; background: #fef3c7; color: #b45309; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; border: 1px solid #fde68a;">
        DAY ${vendor.daysActive} ONBOARDING CHECK-IN
      </div>

      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
        Reminder: Connect Your Email SMTP to Receive Order Alerts
      </h2>

      <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
        Dear <strong>${vendor.ownerName || vendor.storeName}</strong>,
      </p>

      <p style="font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 24px;">
        Congratulations on your store's first week on <strong>Dastiyab Store</strong>! We noticed you have not yet set up your <strong>Store SMTP email settings</strong> in your dashboard.
      </p>

      <p style="font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 24px;">
        Without SMTP settings, you might miss urgent notifications when customers order your items. Taking just 2 minutes to configure SMTP will ensure every order reaches you immediately!
      </p>

      <!-- Action Button -->
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${settingsUrl}" style="display: inline-block; background: #d97706; color: #ffffff; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35);">
          Complete SMTP Setup Now &rarr;
        </a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.6;">
        We wish you great sales and growth on Dastiyab Store! If you need any assistance, feel free to reply directly to this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f1f5f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
      &copy; ${new Date().getFullYear()} Dastiyab Store — Jo Chahiye, Wahi Dastiyab. All rights reserved.
    </div>

  </div>
</body>
</html>
  `;

  return await transporter.sendMail({
    from: `"${config.senderName}" <${config.user}>`,
    to: vendor.email,
    subject: `Reminder: Connect your Store SMTP for Order Alerts — Dastiyab Store`,
    html,
    text: `Hello ${vendor.ownerName || vendor.storeName},\n\nThis is a friendly reminder to configure your Store SMTP Email Settings in your Dastiyab Store Vendor Dashboard at ${settingsUrl} to receive order notifications directly to your email.\n\nRegards,\nDastiyab Store Team`
  });
}

/**
 * 4. Monthly Store Rent Invoice Email
 * Sent when Admin clicks to notify a vendor that their month is completed and store rent is due.
 */
export async function sendVendorRentInvoiceEmail(data: {
  vendor: {
    id: string;
    storeName: string;
    ownerName: string;
    email: string;
    phone?: string | null;
    createdAt?: Date | string;
    daysActive?: number;
    monthsCompleted?: number;
  };
  rentAmount: number;
  paymentDetails: {
    bankName?: string;
    accountTitle?: string;
    accountNumber?: string;
    iban?: string;
    instructions?: string;
  };
}) {
  const { transporter, config } = await getTransporter();
  const baseUrl = getBaseUrl();
  const settingsUrl = `${baseUrl}/vendor/settings`;
  const { vendor, rentAmount, paymentDetails } = data;
  const monthNum = vendor.monthsCompleted && vendor.monthsCompleted > 0 ? vendor.monthsCompleted : 1;
  const formattedRent = Number(rentAmount || 5000).toLocaleString();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Monthly Store Rent Invoice — Dastiyab Store</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px; color: #1e293b;">
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 28px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
        <span style="color: #ef4444;">Dastiyab</span> <span style="color: #f59e0b;">Store</span>
      </h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.85; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
        Official Monthly Store Rent Invoice
      </p>
    </div>

    <!-- Body Content -->
    <div style="padding: 36px 32px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div style="display: inline-block; background: #fef2f2; color: #dc2626; font-size: 12px; font-weight: 800; padding: 5px 12px; border-radius: 20px; border: 1px solid #fee2e2;">
          MONTH ${monthNum} COMPLETED
        </div>
        <div style="font-size: 13px; color: #64748b; font-weight: 600;">
          Billing Cycle: Month ${monthNum}
        </div>
      </div>

      <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
        Store Rent Payment Notice
      </h2>

      <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
        Assalam-o-Alaikum <strong>${vendor.ownerName || vendor.storeName}</strong>,
      </p>

      <p style="font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 24px;">
        Aapke store <strong>${vendor.storeName}</strong> ko Dastiyab Store par register huye <strong>Month ${monthNum}</strong> complete ho chuka hai. Partnership agreement ke mutabiq aapke is month ki store rent fees due hai.
      </p>

      <!-- Amount Highlight Box -->
      <div style="background: linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%); border-radius: 14px; padding: 24px; border: 1.5px solid #fecaca; text-align: center; margin-bottom: 28px;">
        <span style="font-size: 12px; font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 1px;">Total Store Rent Payable</span>
        <div style="font-size: 36px; font-weight: 900; color: #dc2626; margin: 8px 0;">
          Rs. ${formattedRent} <span style="font-size: 18px; font-weight: 700; color: #7f1d1d;">PKR</span>
        </div>
        <p style="font-size: 13px; color: #991b1b; margin: 0; font-weight: 500;">
          Store: <strong>${vendor.storeName}</strong> (Active for ${vendor.daysActive || 30}+ days)
        </p>
      </div>

      <!-- Bank Details Box -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 22px; border: 1px solid #e2e8f0; margin-bottom: 28px;">
        <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 14px 0; display: flex; align-items: center; gap: 8px;">
          💳 Payment Deposit Details:
        </h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px;">Bank / Account:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${paymentDetails.bankName || "Meezan Bank / JazzCash"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Account Title:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${paymentDetails.accountTitle || "Dastiyab Store"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Account / IBAN:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-family: monospace; font-size: 15px;">${paymentDetails.accountNumber || "0123456789"}</td>
            </tr>
            ${paymentDetails.instructions ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Instructions:</td>
              <td style="padding: 8px 0; color: #475569;">${paymentDetails.instructions}</td>
            </tr>` : ""}
          </tbody>
        </table>
      </div>

      <!-- Confirmation Notice -->
      <div style="background: #fffbeb; border-radius: 10px; padding: 16px 18px; border-left: 4px solid #f59e0b; margin-bottom: 28px;">
        <p style="font-size: 13px; line-height: 1.6; color: #92400e; margin: 0;">
          <strong>Receipt Confirmation:</strong> Payment transfer ke baad transaction receipt / screenshot Dastiyab Store Admin ko WhatsApp ya is email par reply karke share kardein taake aapka store active rahe.
        </p>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${settingsUrl}" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 14px 34px; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);">
          Open Vendor Dashboard &rarr;
        </a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.6; text-align: center;">
        Need help or have questions regarding billing? Contact Dastiyab Store Support.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f1f5f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
      &copy; ${new Date().getFullYear()} Dastiyab Store — Jo Chahiye, Wahi Dastiyab. All rights reserved.
    </div>

  </div>
</body>
</html>
  `;

  return await transporter.sendMail({
    from: `"${config.senderName}" <${config.user}>`,
    to: vendor.email,
    subject: `Store Rent Invoice: Month ${monthNum} Due (Rs. ${formattedRent} PKR) — Dastiyab Store`,
    html,
    text: `Assalam-o-Alaikum ${vendor.ownerName || vendor.storeName},\n\nAapke store "${vendor.storeName}" ka Month ${monthNum} complete ho chuka hai. Aapki monthly store rent fees Rs. ${formattedRent} PKR due hai.\n\nBank Details:\nBank: ${paymentDetails.bankName || "Meezan Bank"}\nTitle: ${paymentDetails.accountTitle || "Dastiyab Store"}\nAccount: ${paymentDetails.accountNumber || "0123456789"}\n\nPayment deposit ke baad screenshot Dastiyab Store Admin ke sath share kardein.\n\nShukriya,\nDastiyab Store Management`
  });
}

/**
 * 5. Store Rent Payment Received / Complete Receipt Email
 * Sent when Admin records a vendor's monthly rent payment as complete.
 */
export async function sendVendorRentReceiptEmail(params: {
  vendor: {
    id: string;
    storeName: string;
    ownerName: string;
    email: string;
  };
  amount: number;
  paymentDate: string;
  monthCycle: string;
  paymentMethod?: string;
  transactionRef?: string;
  notes?: string;
}) {
  const { vendor, amount, paymentDate, monthCycle, paymentMethod, transactionRef, notes } = params;
  const { transporter, config } = await getTransporter();
  const baseUrl = getBaseUrl();
  const formattedAmount = Number(amount).toLocaleString();
  const formattedDate = new Date(paymentDate).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Receipt: Store Rent Complete</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #15803d 0%, #16a34a 100%); padding: 36px 32px; text-align: center; color: #ffffff;">
      <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
        ✓ Payment Received & Verified
      </div>
      <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">Store Rent Paid Successfully</h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Official Payment Receipt • Dastiyab Store</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px 32px 28px 32px;">
      <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
        Assalam-o-Alaikum ${vendor.ownerName || vendor.storeName},
      </p>
      <p style="font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 24px;">
        Aapke store <strong>${vendor.storeName}</strong> ki <strong>${monthCycle}</strong> ki store rent payment safalta-purvak receive ho gayi hai aur Admin ne isko verify kar diya hai.
      </p>

      <!-- Amount Box -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 14px; padding: 22px; border: 1.5px solid #bbf7d0; text-align: center; margin-bottom: 26px;">
        <span style="font-size: 12px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 1px;">Amount Received</span>
        <div style="font-size: 36px; font-weight: 900; color: #15803d; margin: 8px 0;">
          Rs. ${formattedAmount} <span style="font-size: 18px; font-weight: 700; color: #166534;">PKR</span>
        </div>
        <div style="display: inline-block; background: #ffffff; padding: 4px 14px; border-radius: 12px; font-size: 12px; font-weight: 800; color: #15803d; border: 1px solid #86efac;">
          Status: PAID & COMPLETED
        </div>
      </div>

      <!-- Receipt Breakdown -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 26px;">
        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 14px 0;">
          🧾 Receipt Details:
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Store Name:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${vendor.storeName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Payment Date:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${formattedDate}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Billing Cycle:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${monthCycle}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Payment Method:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${paymentMethod || "Bank Transfer / Online"}</td>
            </tr>
            ${transactionRef ? `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Reference / Trx ID:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-family: monospace;">${transactionRef}</td>
            </tr>` : ""}
            ${notes ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Admin Notes:</td>
              <td style="padding: 8px 0; color: #475569;">${notes}</td>
            </tr>` : ""}
          </tbody>
        </table>
      </div>

      <div style="background: #f0fdf4; border-radius: 10px; padding: 14px 16px; border-left: 4px solid #16a34a; margin-bottom: 24px;">
        <p style="font-size: 13px; line-height: 1.6; color: #166534; margin: 0;">
          Aapka store Dastiyab Store par seamlessly active aur good standing me hai. Thank you for your partnership!
        </p>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="${baseUrl}/vendor/dashboard" style="display: inline-block; background: #16a34a; color: #ffffff; padding: 13px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3);">
          Go to Vendor Dashboard &rarr;
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f1f5f9; padding: 18px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
      &copy; ${new Date().getFullYear()} Dastiyab Store — Jo Chahiye, Wahi Dastiyab. All rights reserved.
    </div>

  </div>
</body>
</html>
  `;

  return await transporter.sendMail({
    from: `"${config.senderName}" <${config.user}>`,
    to: vendor.email,
    subject: `Payment Receipt: Store Rent Complete (Rs. ${formattedAmount} PKR — ${monthCycle}) — Dastiyab Store`,
    html,
    text: `Assalam-o-Alaikum ${vendor.ownerName || vendor.storeName},\n\nAapke store "${vendor.storeName}" ki ${monthCycle} ki rent payment (Rs. ${formattedAmount} PKR) successfully received and complete ho chuki hai on ${formattedDate}.\n\nAapka store active hai. Shukriya!\nDastiyab Store Management`
  });
}

