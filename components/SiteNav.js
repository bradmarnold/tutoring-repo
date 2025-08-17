import Link from "next/link";

export default function SiteNav() {
  return (
    <nav className="border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-200" />
            <span className="text-lg font-semibold">Bradford Arnold Tutoring</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/learn" className="text-slate-700 hover:text-slate-900">
              Learn
            </Link>
            <Link href="/#features" className="text-slate-700 hover:text-slate-900">
              Features
            </Link>
            <Link href="/#demo" className="text-slate-700 hover:text-slate-900">
              Demo
            </Link>
            <a 
              href="mailto:bradfordm.arnold@gmail.com" 
              className="px-4 py-2 bg-black text-white rounded-xl hover:bg-slate-800"
            >
              Book a Session
            </a>
          </div>

          {/* Mobile menu button - simplified for now */}
          <div className="md:hidden">
            <a 
              href="mailto:bradfordm.arnold@gmail.com" 
              className="px-3 py-1 bg-black text-white rounded-lg text-sm"
            >
              Book
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}