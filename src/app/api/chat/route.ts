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

    // 1. Fetch settings from DB
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'chatbot_settings' }
    });
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
- Products: Premium tech gadgets, home accessories, neck fans, AirPods, laptop stands, earphones.
- Payment: Cash on Delivery (COD) available across Pakistan. Free delivery on orders above Rs.2000.
- Returns: STRICTLY 5-Day Easy Returns policy. NEVER mention 7 days.
- Contact: WhatsApp/Call at 0316-2975195.
- Address: H-151 Moinabad, Model Colony Phase 3 Malir, Karachi, 75100, Pakistan.
- Tone: Keep responses VERY short, concise, and to the point. Use Roman Urdu if the customer speaks Roman Urdu.`;

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
