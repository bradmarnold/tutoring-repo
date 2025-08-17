import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

export const metadata = { title: "Bradford Arnold Tutoring", description: "Physics, Calculus, Chemistry" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">
        <SiteNav />
        <main className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
