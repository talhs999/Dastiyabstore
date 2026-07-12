import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { history, message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let apiKey = '';
    let modelName = 'gemini-1.5-flash';
    let enabled = true;

    // 1. Fetch settings and products from DB
    const [setting, freeDeliverySetting, dbProducts] = await Promise.all([
      prisma.storeSetting.findUnique({ where: { key: 'chatbot_settings' } }),
      prisma.storeSetting.findUnique({ where: { key: 'free_delivery_settings' } }),
      prisma.product.findMany({ select: { category: { select: { name: true } } } })
    ]);

    const uniqueCategories = [...new Set(dbProducts.map(p => p.category?.name).filter(Boolean))];
    const categoryInfo = uniqueCategories.length > 0 
      ? `Our active product categories are: ${uniqueCategories.join(', ')}.`
      : `We have various products available on our shop.`;

    let deliveryInfo = "Standard delivery charges apply based on city.";
    if (freeDeliverySetting && freeDeliverySetting.value) {
      const fd = typeof freeDeliverySetting.value === 'string' ? JSON.parse(freeDeliverySetting.value) : freeDeliverySetting.value;
      if (fd.is_active) {
        deliveryInfo += ` Free delivery on orders above Rs.${fd.threshold}.`;
      }
    }

    if (setting && setting.value) {
      const parsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
      if (parsed.apiKey) apiKey = parsed.apiKey;
      if (parsed.model) {
        modelName = parsed.model;
        if (modelName.includes('pro')) {
           // auto upgrade old models to fast flash for speed
           modelName = 'gemini-1.5-flash';
        }
      }
      if (parsed.enabled === false) enabled = false;
    }

    if (!enabled) {
      return NextResponse.json({ error: 'Chatbot is disabled' }, { status: 403 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured' }, { status: 400 });
    }

    // 2. Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    // Force fastest model if not explicitly set to something else
    const finalModel = 'gemini-3.5-flash'; 
    const model = genAI.getGenerativeModel({ model: finalModel });

    // 3. Format history for Gemini
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const systemPrompt = `You are a helpful, fast, and friendly customer support AI for an online store named 'DastiyabStore' in Pakistan. 
Key Rules:
- PRODUCTS INVENTORY: ${categoryInfo} If a customer asks for a specific item (e.g., "Neck fan", "iPhone", etc.), do NOT automatically say yes. You MUST say: "Please check our [Shop](/shop) page to see if it's currently available, or contact us on WhatsApp to confirm." Do NOT hallucinate or promise products we don't have.
- NEW ARRIVALS: We just launched a premium "Customized Gifts" section! We handcraft beautiful gift baskets with luxury chocolates, flowers, and jewelry for every occasion. Direct users to the /gifts page.
- Payment: Cash on Delivery (COD) is ONLY available for Karachi. For all other cities in Pakistan, we require advance payment via Bank Transfer, JazzCash, or EasyPaisa. ${deliveryInfo}
- Returns: STRICTLY 5-Day Easy Returns policy. NEVER mention 7 days.
- Contact: If they need support or to confirm product availability, ALWAYS give them our number 0316-2975195 AND a clickable button using this exact format: [Chat on WhatsApp](https://wa.me/923162975195)
- Address: H-151 Moinabad, Model Colony Phase 3 Malir, Karachi, 75100, Pakistan.
- Tone: Keep responses VERY short, concise, and to the point. Use Roman Urdu if the customer speaks Roman Urdu.
- LINKS: Whenever you want to guide a customer to a page, you MUST use markdown links like this: [Shop](/shop), [Gifts](/gifts). This will render as a clickable button in the chat.`;

    const chatParams = {
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "Understood. How can I help you today?" }] },
        ...formattedHistory
      ],
      generationConfig: { maxOutputTokens: 2000, temperature: 0.5 },
    };

    let resultStream;
    try {
      const chat = model.startChat(chatParams);
      resultStream = await chat.sendMessageStream(message);
    } catch (err: any) {
      console.error("ACTUAL ERROR:", err.message);
      if (err.message?.includes('404 Not Found') || err.message?.includes('is not found for API version') || err.message?.includes('503 Service Unavailable')) {
        console.log(`Model ${modelName} failed, falling back to gemini-3.1-pro`);
        const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-3.1-pro' });
        const fallbackChat = fallbackModel.startChat(chatParams);
        try {
          resultStream = await fallbackChat.sendMessageStream(message);
        } catch (fallbackErr: any) {
          throw new Error("Hamara AI system abhi thora busy hai. Baraye meharbani kuch dair baad dobara koshish karein. Error: " + err.message);
        }
      } else {
        throw new Error("Hamara AI system abhi thora busy hai. Baraye meharbani kuch dair baad dobara koshish karein. Error: " + err.message);
      }
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of resultStream.stream) {
            controller.enqueue(encoder.encode(chunk.text()));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });

  } catch (error: any) {
    console.error('Gemini Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
