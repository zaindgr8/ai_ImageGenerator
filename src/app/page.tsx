import ImageGenerator from "./components/ImageGenerator";
import AuthWrapper from "./components/AuthWrapper";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <AuthWrapper>
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              AI Image Generator
            </h1>
            <ImageGenerator />
          </div>
        </div>
      </main>
    </AuthWrapper>
  );
}
