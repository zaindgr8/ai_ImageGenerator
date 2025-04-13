import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const base64Audio = body.audio;

    // Convert the base64 audio data to a Buffer
    const audioBuffer = Buffer.from(base64Audio, "base64");

    const data = await openai.audio.transcriptions.create({
      file: {
        buffer: audioBuffer,
        name: "audio.wav",
        type: "audio/wav",
      } as any,
      model: "whisper-1",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Failed to process audio" },
      { status: 500 }
    );
  }
}
