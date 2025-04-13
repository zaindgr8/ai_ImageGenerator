"use client";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { saveImageToStorage } from "@/lib/firebase/firebaseUtils";

type ModelType = "google-imagen" | "ideogram";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] =
    useState<ModelType>("google-imagen");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSaveSuccess(null);
    setImageUrl(null); // Clear previous image

    try {
      console.log(
        `Generating image with ${selectedModel} model and prompt: "${prompt}"`
      );

      const response = await fetch("/api/replicate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, model: selectedModel }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      if (!data.imageUrl) {
        throw new Error("No image URL returned from the API");
      }

      console.log("Image generation successful, URL:", data.imageUrl);
      setImageUrl(data.imageUrl);

      // Auto-save to Firebase if user is authenticated
      if (user) {
        setIsSaving(true);
        console.log("Starting to save image to Firebase...");

        try {
          await saveImageToStorage(user, data.imageUrl, prompt, selectedModel);
          console.log("Image saved successfully to Firebase");
          setSaveSuccess(true);
        } catch (saveError) {
          console.error("Failed to save image:", saveError);
          setSaveSuccess(false);
          // We still show the image even if saving failed
        } finally {
          setIsSaving(false);
        }
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      setError(error.message || "An error occurred while generating the image");
      setImageUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="model-selection" className="font-medium">
            Select Model
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setSelectedModel("google-imagen")}
              className={`px-4 py-2 rounded ${
                selectedModel === "google-imagen"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Google Imagen
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel("ideogram")}
              className={`px-4 py-2 rounded ${
                selectedModel === "ideogram"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Ideogram
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="prompt" className="block font-medium mb-1">
            Prompt
          </label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isSaving || !prompt.trim()}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? "Generating..." : "Generate Image"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {isSaving && (
        <div className="mt-4 p-2 bg-yellow-100 text-yellow-700 rounded flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Saving image...
        </div>
      )}

      {saveSuccess === true && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          Image saved successfully!
        </div>
      )}

      {saveSuccess === false && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          Failed to save image.
        </div>
      )}

      {imageUrl && (
        <div className="mt-4">
          <Image
            src={imageUrl}
            alt="Generated image"
            width={512}
            height={512}
            className="rounded-lg"
            priority
          />
          <p className="mt-2 text-sm text-gray-600">{prompt}</p>
        </div>
      )}
    </div>
  );
}
