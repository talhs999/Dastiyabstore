import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVendorRentInvoiceEmail, sendVendorRentReceiptEmail } from "@/lib/vendorNotifications";

export const dynamic = "force-dynamic";

const DEFAULT_RENT_SETTINGS = {
  default_rent: 5000,
  bank_name: "Meezan Bank Ltd",
  account_title: "Dastiyab Store Official",
  account_number: "0102030405060708",
  instructions: "Deposit online or via JazzCash/Easypaisa and share the screenshot with Admin.",
  custom_rents: {} as Record<string, number>
};

export interface RentPaymentRecord {
  id: string;
  vendorId: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone?: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  monthCycle: string; // e.g. "Month 1", "Month 2"
  status: "completed" | "pending";
  paymentMethod: string;
  transactionRef?: string;
  notes?: string;
  recordedAt: string;
}

function cleanWhatsAppNumber(phone: string) {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "92" + cleaned.slice(1);
  } else if (!cleaned.startsWith("92")) {
    cleaned = "92" + cleaned;
  }
  return cleaned;
}

export async function GET() {
  try {
    // 1. Load settings
    const settingRecord = await prisma.storeSetting.findUnique({
      where: { key: "vendor_rent_settings" }
    });

    let settings = DEFAULT_RENT_SETTINGS;
    if (settingRecord && settingRecord.value) {
      try {
        const parsed = typeof settingRecord.value === "string" ? JSON.parse(settingRecord.value) : settingRecord.value;
        settings = { ...DEFAULT_RENT_SETTINGS, ...parsed };
      } catch (e) {
        console.error("Error parsing vendor_rent_settings:", e);
      }
    }

    // 2. Load payment records
    const paymentsRecord = await prisma.storeSetting.findUnique({
      where: { key: "vendor_rent_payments" }
    });

    let allPayments: RentPaymentRecord[] = [];
    if (paymentsRecord && paymentsRecord.value) {
      try {
        const parsed = typeof paymentsRecord.value === "string" ? JSON.parse(paymentsRecord.value) : paymentsRecord.value;
        if (Array.isArray(parsed)) {
          allPayments = parsed;
        }
      } catch (e) {
        console.error("Error parsing vendor_rent_payments:", e);
      }
    }

    // Sort all payments date-wise (newest first)
    allPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    // 3. Load all stores
    const stores = await prisma.store.findMany({
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true, address: true, city: true }
        }
      },
      orderBy: { created_at: "asc" }
    });

    const now = new Date();

    const storesWithRent = stores.map(s => {
      const createdAt = new Date(s.created_at);
      const diffMs = now.getTime() - createdAt.getTime();
      const daysActive = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      const monthsCompleted = Math.floor(daysActive / 30);
      const isMonthCompleted = daysActive >= 30;
      const monthNum = monthsCompleted > 0 ? monthsCompleted : 1;
      const rentAmount = settings.custom_rents?.[s.id] || settings.default_rent || 5000;

      // Filter payments for this store
      const storePayments = allPayments.filter(p => p.vendorId === s.id);
      storePayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

      const lastPayment = storePayments[0] || null;
      const totalPaidAmount = storePayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const paymentsCount = storePayments.length;

      // Calculate rent status & next due date
      let rentStatus: "paid" | "due" | "trial" = "trial";
      let nextDueDate: string;

      if (lastPayment) {
        const lastPayDate = new Date(lastPayment.paymentDate);
        const daysSinceLastPayment = Math.floor((now.getTime() - lastPayDate.getTime()) / (1000 * 60 * 60 * 24));
        const nextDueObj = new Date(lastPayDate);
        nextDueObj.setDate(nextDueObj.getDate() + 30);
        nextDueDate = nextDueObj.toISOString().split("T")[0];

        // If paid within 30 days, or paid count >= months completed
        if (daysSinceLastPayment < 30 || paymentsCount >= Math.max(1, monthsCompleted)) {
          rentStatus = "paid";
        } else {
          rentStatus = "due";
        }
      } else {
        const firstDueObj = new Date(createdAt);
        firstDueObj.setDate(firstDueObj.getDate() + 30);
        nextDueDate = firstDueObj.toISOString().split("T")[0];

        if (isMonthCompleted) {
          rentStatus = "due";
        } else {
          rentStatus = "trial";
        }
      }

      const formattedRent = Number(rentAmount).toLocaleString();
      const phone = s.owner?.phone ? s.owner.phone.trim() : null;

      const whatsappText = `*Dastiyab Store — Monthly Store Rent Invoice*
Assalam-o-Alaikum *${s.owner?.name || s.name}*,

Aapke store *${s.name}* ka *Month ${monthNum}* complete ho chuka hai (${daysActive} Din Active).

📌 *Monthly Store Rent:* Rs. ${formattedRent} PKR

💳 *Payment Bank Details:*
• Bank: ${settings.bank_name || "Meezan Bank"}
• Title: ${settings.account_title || "Dastiyab Store"}
• Account: ${settings.account_number || "0123456789"}
${settings.instructions ? `• Note: ${settings.instructions}` : ""}

Payment deposit ke baad is WhatsApp number par receipt / transaction screenshot share kardein taake aapka store seamlessly active rahe.

Shukriya!
*Dastiyab Store Management*`;

      const whatsappUrl = phone ? `https://wa.me/${cleanWhatsAppNumber(phone)}?text=${encodeURIComponent(whatsappText)}` : null;

      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        ownerName: s.owner?.name || s.name,
        email: s.owner?.email,
        phone,
        createdAt: s.created_at,
        daysActive,
        monthsCompleted,
        isMonthCompleted,
        monthNum,
        rentAmount,
        rentStatus, // "paid" | "due" | "trial"
        lastPayment,
        nextDueDate,
        totalPaidAmount,
        paymentsCount,
        payments: storePayments,
        whatsappUrl,
        whatsappText
      };
    });

    const totalCollected = allPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalDueCount = storesWithRent.filter(s => s.rentStatus === "due").length;

    return NextResponse.json({
      settings,
      stores: storesWithRent,
      allPayments,
      totalCollected,
      totalDueCount
    });
  } catch (error) {
    console.error("Error in GET /api/admin/vendors/rent:", error);
    return NextResponse.json({ error: "Failed to fetch rent details" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Save Settings
    if (action === "save_settings") {
      const { default_rent, bank_name, account_title, account_number, instructions, custom_rents } = body;
      const updatedValue = {
        default_rent: Number(default_rent || 5000),
        bank_name: bank_name || "",
        account_title: account_title || "",
        account_number: account_number || "",
        instructions: instructions || "",
        custom_rents: custom_rents || {}
      };

      await prisma.storeSetting.upsert({
        where: { key: "vendor_rent_settings" },
        update: { value: updatedValue },
        create: { key: "vendor_rent_settings", value: updatedValue }
      });

      return NextResponse.json({ success: true, settings: updatedValue });
    }

    // 2. Send Rent Notice to a specific vendor
    if (action === "send_rent_notice") {
      const { vendorId, rentAmount } = body;
      if (!vendorId) {
        return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
      }

      const store = await prisma.store.findUnique({
        where: { id: vendorId },
        include: { owner: true }
      });

      if (!store || !store.owner?.email) {
        return NextResponse.json({ error: "Store or owner email not found" }, { status: 404 });
      }

      // Fetch rent settings
      const settingRecord = await prisma.storeSetting.findUnique({
        where: { key: "vendor_rent_settings" }
      });
      let settings = DEFAULT_RENT_SETTINGS;
      if (settingRecord && settingRecord.value) {
        try {
          const parsed = typeof settingRecord.value === "string" ? JSON.parse(settingRecord.value) : settingRecord.value;
          settings = { ...DEFAULT_RENT_SETTINGS, ...parsed };
        } catch (e) {}
      }

      const effectiveRent = Number(rentAmount || settings.custom_rents?.[store.id] || settings.default_rent || 5000);
      const createdAt = new Date(store.created_at);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const daysActive = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      const monthsCompleted = Math.floor(daysActive / 30);

      // Send Email
      await sendVendorRentInvoiceEmail({
        vendor: {
          id: store.id,
          storeName: store.name,
          ownerName: store.owner.name || store.name,
          email: store.owner.email,
          phone: store.owner.phone,
          createdAt: store.created_at,
          daysActive,
          monthsCompleted
        },
        rentAmount: effectiveRent,
        paymentDetails: {
          bankName: settings.bank_name,
          accountTitle: settings.account_title,
          accountNumber: settings.account_number,
          instructions: settings.instructions
        }
      });

      // Prepare WhatsApp link
      const phone = store.owner.phone ? store.owner.phone.trim() : null;
      const monthNum = monthsCompleted > 0 ? monthsCompleted : 1;
      const whatsappText = `*Dastiyab Store — Monthly Store Rent Invoice*
Assalam-o-Alaikum *${store.owner.name || store.name}*,

Aapke store *${store.name}* ka *Month ${monthNum}* complete ho chuka hai (${daysActive} Din Active).

📌 *Monthly Store Rent:* Rs. ${effectiveRent.toLocaleString()} PKR

💳 *Payment Bank Details:*
• Bank: ${settings.bank_name || "Meezan Bank"}
• Title: ${settings.account_title || "Dastiyab Store"}
• Account: ${settings.account_number || "0123456789"}
${settings.instructions ? `• Note: ${settings.instructions}` : ""}

Payment deposit ke baad is WhatsApp number par receipt / transaction screenshot share kardein taake aapka store seamlessly active rahe.

Shukriya!
*Dastiyab Store Management*`;

      const whatsappUrl = phone ? `https://wa.me/${cleanWhatsAppNumber(phone)}?text=${encodeURIComponent(whatsappText)}` : null;

      return NextResponse.json({
        success: true,
        emailSent: true,
        email: store.owner.email,
        phone,
        rentAmount: effectiveRent,
        whatsappUrl,
        whatsappText
      });
    }

    // 3. Record Rent Payment (Mark Rent Complete with Calendar/Date)
    if (action === "record_payment") {
      const {
        vendorId,
        amount,
        paymentDate,
        monthCycle,
        paymentMethod,
        transactionRef,
        notes,
        sendReceiptEmail
      } = body;

      if (!vendorId) {
        return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
      }

      const store = await prisma.store.findUnique({
        where: { id: vendorId },
        include: { owner: true }
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      // Fetch existing payments
      const paymentsRecord = await prisma.storeSetting.findUnique({
        where: { key: "vendor_rent_payments" }
      });

      let existingPayments: RentPaymentRecord[] = [];
      if (paymentsRecord && paymentsRecord.value) {
        try {
          const parsed = typeof paymentsRecord.value === "string" ? JSON.parse(paymentsRecord.value) : paymentsRecord.value;
          if (Array.isArray(parsed)) {
            existingPayments = parsed;
          }
        } catch (e) {}
      }

      const newPayment: RentPaymentRecord = {
        id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        vendorId,
        storeName: store.name,
        ownerName: store.owner?.name || store.name,
        email: store.owner?.email || "",
        phone: store.owner?.phone || undefined,
        amount: Number(amount || 5000),
        paymentDate: paymentDate || new Date().toISOString().split("T")[0],
        monthCycle: monthCycle || "Month 1",
        status: "completed",
        paymentMethod: paymentMethod || "Bank Transfer",
        transactionRef: transactionRef ? transactionRef.trim() : "",
        notes: notes ? notes.trim() : "",
        recordedAt: new Date().toISOString()
      };

      const updatedPayments = [newPayment, ...existingPayments];

      await prisma.storeSetting.upsert({
        where: { key: "vendor_rent_payments" },
        update: { value: updatedPayments as any },
        create: { key: "vendor_rent_payments", value: updatedPayments as any }
      });

      // Optionally send receipt email to vendor
      let receiptEmailSent = false;
      if (sendReceiptEmail !== false && store.owner?.email) {
        try {
          await sendVendorRentReceiptEmail({
            vendor: {
              id: store.id,
              storeName: store.name,
              ownerName: store.owner.name || store.name,
              email: store.owner.email
            },
            amount: newPayment.amount,
            paymentDate: newPayment.paymentDate,
            monthCycle: newPayment.monthCycle,
            paymentMethod: newPayment.paymentMethod,
            transactionRef: newPayment.transactionRef,
            notes: newPayment.notes
          });
          receiptEmailSent = true;
        } catch (emailErr) {
          console.error("Error sending rent receipt email:", emailErr);
        }
      }

      return NextResponse.json({
        success: true,
        payment: newPayment,
        receiptEmailSent
      });
    }

    // 4. Delete Payment Record
    if (action === "delete_payment") {
      const { paymentId } = body;
      if (!paymentId) {
        return NextResponse.json({ error: "paymentId is required" }, { status: 400 });
      }

      const paymentsRecord = await prisma.storeSetting.findUnique({
        where: { key: "vendor_rent_payments" }
      });

      if (!paymentsRecord || !paymentsRecord.value) {
        return NextResponse.json({ success: true });
      }

      const parsed = typeof paymentsRecord.value === "string" ? JSON.parse(paymentsRecord.value) : paymentsRecord.value;
      const updatedPayments = Array.isArray(parsed) ? parsed.filter((p: any) => p.id !== paymentId) : [];

      await prisma.storeSetting.update({
        where: { key: "vendor_rent_payments" },
        data: { value: updatedPayments as any }
      });

      return NextResponse.json({ success: true, count: updatedPayments.length });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in POST /api/admin/vendors/rent:", error);
    return NextResponse.json({ error: error.message || "Failed to process rent action" }, { status: 500 });
  }
}
