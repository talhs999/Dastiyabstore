import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { email }
    });

    if (!customer) {
      // Return success even if customer doesn't exist to prevent email enumeration
      return NextResponse.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await prisma.customer.update({
      where: { email },
      data: {
        reset_token: token,
        reset_token_expiry: tokenExpiry
      }
    });

    // Fetch SMTP settings
    const smtpSetting = await prisma.storeSetting.findUnique({
      where: { key: 'smtp_settings' }
    });

    let smtpSettings = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
      senderName: process.env.SMTP_SENDER_NAME || 'Dastiyab Store'
    };

    if (smtpSetting && smtpSetting.value) {
      try {
        const parsed = typeof smtpSetting.value === 'string' ? JSON.parse(smtpSetting.value) : smtpSetting.value;
        smtpSettings = { ...smtpSettings, ...parsed };
      } catch (e) {
        console.error('Error parsing SMTP settings:', e);
      }
    }

    if (!smtpSettings.user || !smtpSettings.password) {
      console.error("SMTP credentials not configured.");
      return NextResponse.json({ error: 'Email service is not configured' }, { status: 500 });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.host,
      port: smtpSettings.port,
      secure: smtpSettings.port === 465,
      auth: {
        user: smtpSettings.user,
        pass: smtpSettings.password
      }
    });

    // Create reset URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Send Email
    await transporter.sendMail({
      from: `"${smtpSettings.senderName}" <${smtpSettings.user}>`,
      to: email,
      subject: 'Reset your password - Dastiyab Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827;">Password Reset Request</h2>
          <p style="color: #4b5563; line-height: 1.5;">Hello ${customer.name || 'Customer'},</p>
          <p style="color: #4b5563; line-height: 1.5;">We received a request to reset the password for your account associated with this email address. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #4b5563; line-height: 1.5;">This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Dastiyab Store. All rights reserved.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });

  } catch (error) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}
