export const metadata = { title: "Bradford Arnold Tutoring", description: "Physics, Calculus, Chemistry" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-10">{children}</div>
      </body>
    </html>
  );
}
