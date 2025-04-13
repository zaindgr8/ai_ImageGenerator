"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { getUserImages, GeneratedImage } from "@/lib/firebase/firebaseUtils";
import AuthWrapper from "@/app/components/AuthWrapper";
import Navbar from "@/app/components/Navbar";
import { format } from "date-fns";

export default function MyImages() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    async function loadImages() {
      if (!user) return;

      try {
        setLoading(true);
        const userImages = await getUserImages(user);

        // Sort images by timestamp (newest first)
        userImages.sort((a, b) => b.timestamp - a.timestamp);

        setImages(userImages);
      } catch (error) {
        console.error("Error loading images:", error);
        setError("Failed to load your images");
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, [user]);

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              My Generated Images
            </h1>

            {loading && (
              <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                {error}
              </div>
            )}

            {!loading && images.length === 0 && (
              <div className="text-center my-12 text-gray-500">
                <p>You haven&apos;t generated any images yet.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div className="relative h-64 w-full">
                    {image.imageUrl ? (
                      <Image
                        src={image.imageUrl}
                        alt={image.prompt || "Generated image"}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Set a placeholder on error
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://via.placeholder.com/400x400?text=Image+Not+Available";
                          target.onerror = null; // Prevent infinite error loop
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <p className="text-gray-500">Image not available</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-1">
                      {format(new Date(image.timestamp), "MMM d, yyyy h:mm a")}
                    </p>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Model: {image.model}
                    </p>
                    <p className="text-sm text-gray-900">
                      {image.prompt || "No prompt available"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
