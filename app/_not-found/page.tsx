import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-light-gray flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            404 - Page Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/" className="btn btn-primary inline-block">
            Go Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
