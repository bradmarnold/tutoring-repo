import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-12">
      <header className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <h1 className="text-2xl font-semibold tracking-tight">Bradford Arnold Tutoring</h1>
      </header>

      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Focused help in Physics, Calculus, and Chemistry</h2>
          <p className="text-slate-700">One-on-one and group sessions. Timed practice quizzes with instant, step-by-step explanations.</p>
          <ul className="list-disc ml-5 text-slate-700 space-y-1">
            <li>University of Texas at Arlington tutor, 4.0 GPA</li>
            <li>Custom prep by topic and exam</li>
            <li>Clear solutions with foundations, not shortcuts</li>
          </ul>
          <div className="flex gap-4">
            <a href="mailto:bradfordm.arnold@gmail.com" className="px-4 py-2 rounded-xl bg-black text-white">Book a session</a>
            <Link href="#quizzes" className="px-4 py-2 rounded-xl border">Try a demo quiz</Link>
          </div>
        </div>
        <div className="border rounded-2xl p-6">
          <p className="text-sm text-slate-500">How it works</p>
          <ol className="mt-2 space-y-2 text-slate-800">
            <li>1. I send each student a private link to a timed quiz.</li>
            <li>2. You work under a realistic clock. No distractions.</li>
            <li>3. You get scored and see guided explanations for each miss.</li>
          </ol>
        </div>
      </section>

      <section id="quizzes" className="border rounded-2xl p-6">
        <h3 className="text-lg font-semibold">Demo</h3>
        <p className="text-slate-700">Use your tokenized link. Example format:</p>
        <code className="block mt-2 bg-slate-100 p-3 rounded">/quiz/QUIZ_ID?token=YOUR_TOKEN</code>
      </section>
    </main>
  );
}
