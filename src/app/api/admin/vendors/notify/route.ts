import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendVendorProfileUpdateEmail,
  sendVendorSmtpSetupEmail,
  sendVendor5DayReminderEmail
} from "@/lib/vendorNotifications";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: { owner: true }
    });

    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const missingProfile = stores.filter(s => !s.owner?.phone || !s.owner?.address);
    const missingSmtp = stores.filter(s => !s.smtp_user);
    const eligible5DayReminder = stores.filter(s => {
      const isOver5Days = new Date(s.created_at) <= fiveDaysAgo;
      const noSmtp = !s.smtp_user;
      return isOver5Days && noSmtp;
    });

    return NextResponse.json({
      totalStores: stores.length,
      missingProfileCount: missingProfile.length,
      missingSmtpCount: missingSmtp.length,
      eligible5DayReminderCount: eligible5DayReminder.length,
      stores: stores.map(s => ({
        id: s.id,
        name: s.name,
        ownerName: s.owner?.name,
        email: s.owner?.email,
        phone: s.owner?.phone,
        address: s.owner?.address,
        hasSmtp: Boolean(s.smtp_user),
        createdAt: s.created_at,
        isOver5Days: new Date(s.created_at) <= fiveDaysAgo
      }))
    });
  } catch (error) {
    console.error("Error fetching vendor notification stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, vendorId } = body;

    let targetStores: any[] = [];
    if (vendorId) {
      const single = await prisma.store.findUnique({
        where: { id: vendorId },
        include: { owner: true }
      });
      if (single) targetStores = [single];
    } else {
      targetStores = await prisma.store.findMany({
        include: { owner: true }
      });
    }

    if (targetStores.length === 0) {
      return NextResponse.json({ error: "No vendors found" }, { status: 404 });
    }

    const results: { email: string; store: string; status: "sent" | "failed"; error?: string }[] = [];

    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    for (const store of targetStores) {
      const email = store.owner?.email;
      if (!email) {
        results.push({ email: "unknown", store: store.name, status: "failed", error: "Missing login email" });
        continue;
      }

      const vendorData = {
        id: store.id,
        storeName: store.name,
        ownerName: store.owner?.name || store.name,
        email: email
      };

      try {
        if (action === "profile_update") {
          await sendVendorProfileUpdateEmail(vendorData);
          results.push({ email, store: store.name, status: "sent" });
        } else if (action === "smtp_setup") {
          await sendVendorSmtpSetupEmail(vendorData);
          results.push({ email, store: store.name, status: "sent" });
        } else if (action === "check_5days") {
          const storeCreatedAt = new Date(store.created_at);
          const isOver5Days = storeCreatedAt <= fiveDaysAgo;
          const noSmtp = !store.smtp_user;

          // Only send to vendors who created store 5+ days ago and haven't set up SMTP
          if (isOver5Days && noSmtp) {
            const diffDays = Math.max(5, Math.floor((now.getTime() - storeCreatedAt.getTime()) / (1000 * 60 * 60 * 24)));
            await sendVendor5DayReminderEmail({
              ...vendorData,
              daysActive: diffDays
            });
            results.push({ email, store: store.name, status: "sent" });
          } else {
            // Skipped because not eligible
          }
        }
      } catch (err: any) {
        console.error(`Failed to send email to ${email}:`, err);
        results.push({ email, store: store.name, status: "failed", error: err.message || "Email send failure" });
      }
    }

    const sentCount = results.filter(r => r.status === "sent").length;
    return NextResponse.json({
      success: true,
      action,
      sentCount,
      totalAttempted: results.length,
      results
    });
  } catch (error: any) {
    console.error("API error in vendor notify:", error);
    return NextResponse.json({ error: error.message || "Failed to notify vendors" }, { status: 500 });
  }
}
