import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const TIMEOUT_MS = 60000; // 60 second timeout

// Function to execute with timeout
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
};

type ModelType = "google-imagen" | "ideogram";

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const selectedModel = (model as ModelType) || "google-imagen";
    console.log(
      `API: Starting image generation with ${selectedModel} model and prompt: ${prompt}`
    );

    let output;

    try {
      if (selectedModel === "google-imagen") {
        output = await withTimeout(
          replicate.run("google/imagen-3", {
            input: {
              aspect_ratio: "1:1",
              prompt: prompt,
              safety_filter_level: "block_medium_and_above",
            },
          }),
          TIMEOUT_MS
        );
      } else if (selectedModel === "ideogram") {
        output = await withTimeout(
          replicate.run("ideogram-ai/ideogram-v2a", {
            input: {
              aspect_ratio: "1:1",
              magic_prompt_option: "Auto",
              prompt: prompt,
              resolution: "None",
              style_type: "None",
            },
          }),
          TIMEOUT_MS
        );
      } else {
        return NextResponse.json(
          { error: `Unsupported model: ${selectedModel}` },
          { status: 400 }
        );
      }
    } catch (modelError: any) {
      console.error(`API: Model error with ${selectedModel}:`, modelError);
      return NextResponse.json(
        {
          error: `Error generating image: ${
            modelError.message || "Model error"
          }`,
        },
        { status: 500 }
      );
    }

    console.log(
      `API: Received output from ${selectedModel}:`,
      Array.isArray(output)
        ? `Array with ${output.length} items`
        : typeof output
    );

    // Handle response from either model
    if (Array.isArray(output) && output.length > 0) {
      return NextResponse.json({ imageUrl: output[0] });
    } else if (typeof output === "string") {
      return NextResponse.json({ imageUrl: output });
    } else {
      console.error(
        `API: Unexpected output format from ${selectedModel}:`,
        output
      );
      return NextResponse.json(
        { error: "Unexpected response format from image generation model" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("API: General error:", error);
    return NextResponse.json(
      {
        error:
          "Image generation failed: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
