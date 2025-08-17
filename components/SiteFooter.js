import Link from "next/link";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-slate-200 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-full bg-slate-200" />
              <span className="font-semibold">Bradford Arnold Tutoring</span>
            </div>
            <p className="text-slate-600 text-sm">
              Expert tutoring in Physics, Calculus, and Chemistry with personalized practice quizzes.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Learn</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="/learn" className="hover:text-slate-900">Browse Topics</Link></li>
              <li><Link href="/learn/calc-1/derivatives" className="hover:text-slate-900">Calculus I</Link></li>
              <li><Link href="/learn/phys-1/kinematics" className="hover:text-slate-900">Physics I</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Get Started</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="mailto:bradfordm.arnold@gmail.com" className="hover:text-slate-900">Book a Session</a></li>
              <li><Link href="/#demo" className="hover:text-slate-900">Try Demo Quiz</Link></li>
              <li><Link href="/admin" className="hover:text-slate-900">Teacher Login</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 mt-8 pt-6 text-center text-sm text-slate-600">
          © {currentYear} Bradford Arnold Tutoring. All rights reserved.
        </div>
      </div>
    </footer>
  );
}