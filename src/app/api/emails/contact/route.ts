import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { name, phone, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required contact form fields" }, { status: 400 });
    }

    // 1. Fetch SMTP settings from Supabase
    const { data: smtpData, error: smtpError } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "smtp_settings")
      .single();

    let smtpSettings = {
      host: "smtp.gmail.com",
      port: 465,
      user: "muddassirr067@gmail.com",
      password: "mhhf fkoj ibuu iycq",
      senderName: "Dastiyab Store",
      adminEmail: "muddassirr067@gmail.com"
    };

    if (!smtpError && smtpData && smtpData.value) {
      try {
        const parsed = typeof smtpData.value === "string" ? JSON.parse(smtpData.value) : smtpData.value;
        smtpSettings = { ...smtpSettings, ...parsed };
      } catch (e) {
        console.error("Error parsing SMTP settings from database:", e);
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

    // 3. Send email to the Admin
    await transporter.sendMail({
      from: `"${smtpSettings.senderName} Contact Form" <${smtpSettings.user}>`,
      to: smtpSettings.adminEmail,
      replyTo: email,
      subject: `[Contact Form] ${subject} - ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 12px; line-height: 1.6; color: #1f2937;">
          <h2 style="color: #dc2626; margin-top: 0; border-bottom: 2px solid #f3f4f6; padding-bottom: 12px;">New Inquiry Received</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 0; color: #6b7280; width: 120px;"><strong>Name:</strong></td>
              <td style="padding: 8px 0; color: #111827; font-weight: 600;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; color: #dc2626; font-weight: 600;"><a href="mailto:${email}" style="color: #dc2626; text-decoration: none;">${email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 0; color: #6b7280;"><strong>Phone/WhatsApp:</strong></td>
              <td style="padding: 8px 0; color: #111827;">${phone || "Not provided"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 0; color: #6b7280;"><strong>Subject:</strong></td>
              <td style="padding: 8px 0; color: #111827; font-weight: 600;">${subject}</td>
            </tr>
          </table>

          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #f3f4f6; margin-bottom: 20px;">
            <h4 style="margin: 0 0 8px 0; color: #4b5563; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message</h4>
            <p style="margin: 0; font-size: 14px; white-space: pre-wrap; color: #1f2937;">${message}</p>
          </div>

          <p style="font-size: 12px; color: #9ca3af; margin: 0; border-top: 1px solid #f3f4f6; padding-top: 12px; text-align: center;">
            You can directly click "Reply" to respond to the customer at their email: ${email}.
          </p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
