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
    let modelName = 'gemini-3.5-flash';
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
        if (modelName.includes('1.5') || modelName.includes('pro')) {
           // auto upgrade old models
           modelName = 'gemini-3.5-flash';
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
    const model = genAI.getGenerativeModel({ model: modelName });

    // 3. Format history for Gemini
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const systemPrompt = `You are a helpful, friendly customer support AI for an online store named 'DastiyabStore' in Pakistan. 
Key Information:
- We sell premium tech gadgets, home accessories, neck fans, AirPods, laptop stands, earphones, and more.
- Payment: We offer Cash on Delivery (COD) across Pakistan.
- Returns: 7-Day Easy Returns policy.
- Contact: Phone/WhatsApp at 0316-2975195.
- Address: H-151 Moinabad, Model Colony Phase 3 Malir, Karachi, 75100, Pakistan.
- Tone: Be polite, concise, and helpful. Use Roman Urdu occasionally if the customer speaks in Roman Urdu, but default to English.`;

    const chatParams = {
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "Understood. How can I help you today?" }] },
        ...formattedHistory
      ],
      generationConfig: { maxOutputTokens: 2000, temperature: 0.7 },
    };

    let resultStream;
    try {
      const chat = model.startChat(chatParams);
      resultStream = await chat.sendMessageStream(message);
    } catch (err: any) {
      if (err.message?.includes('404 Not Found') || err.message?.includes('is not found for API version') || err.message?.includes('503 Service Unavailable')) {
        console.log(`Model ${modelName} failed, falling back to gemini-3.1-pro`);
        const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-3.1-pro' });
        const fallbackChat = fallbackModel.startChat(chatParams);
        try {
          resultStream = await fallbackChat.sendMessageStream(message);
        } catch (fallbackErr: any) {
          throw new Error("Hamara AI system abhi thora busy hai. Baraye meharbani kuch dair baad dobara koshish karein.");
        }
      } else {
        throw new Error("Hamara AI system abhi thora busy hai. Baraye meharbani kuch dair baad dobara koshish karein.");
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
