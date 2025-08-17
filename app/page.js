import Link from "next/link";
import DemoLauncher from "@/components/DemoLauncher";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900">
          Master Physics, Calculus & Chemistry
        </h1>
        <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
          Get personalized tutoring with timed practice quizzes, instant AI explanations, 
          and step-by-step solutions. Build confidence through focused practice.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="mailto:bradfordm.arnold@gmail.com" 
            className="px-8 py-4 bg-black text-white rounded-2xl font-semibold hover:bg-slate-800 transition-colors"
          >
            Book a Session
          </a>
          <Link 
            href="#demo" 
            className="px-8 py-4 border border-slate-300 rounded-2xl font-semibold hover:bg-slate-50 transition-colors"
          >
            Try Demo Quiz
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-slate-50 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">How it works</h2>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto">
            A simple, proven approach to learning that builds real understanding
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-blue-600 font-bold text-xl">1</span>
            </div>
            <h3 className="font-semibold text-lg">Get Your Link</h3>
            <p className="text-slate-600">Receive a private link to a timed quiz tailored to your needs</p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-green-600 font-bold text-xl">2</span>
            </div>
            <h3 className="font-semibold text-lg">Practice Under Pressure</h3>
            <p className="text-slate-600">Work through problems with a realistic timer, no distractions</p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-purple-600 font-bold text-xl">3</span>
            </div>
            <h3 className="font-semibold text-lg">Learn from Mistakes</h3>
            <p className="text-slate-600">Get your score plus guided explanations for every wrong answer</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="space-y-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Why students choose us</h2>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto">
            Focused learning tools designed by a 4.0 GPA tutor at University of Texas at Arlington
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-600 font-bold">⏱</span>
            </div>
            <h3 className="text-xl font-semibold">Timed Practice</h3>
            <p className="text-slate-700">
              Build exam confidence with realistic time pressure. Learn to work efficiently under constraints.
            </p>
          </div>
          <div className="border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-green-600 font-bold">🧠</span>
            </div>
            <h3 className="text-xl font-semibold">AI Explanations</h3>
            <p className="text-slate-700">
              Get instant, step-by-step explanations for every mistake. Understand the concepts, not just the answers.
            </p>
          </div>
          <div className="border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-purple-600 font-bold">📊</span>
            </div>
            <h3 className="text-xl font-semibold">Teacher Dashboard</h3>
            <p className="text-slate-700">
              Track progress across topics with detailed analytics. See exactly where to focus next.
            </p>
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Subjects we cover</h2>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto">
            From foundational concepts to advanced problem-solving
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/learn/calc-1/derivatives" className="border border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition-colors group">
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">Calculus I</h3>
            <p className="text-slate-600">Limits, derivatives, applications, optimization</p>
          </Link>
          <Link href="/learn/phys-1/kinematics" className="border border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition-colors group">
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">Physics I</h3>
            <p className="text-slate-600">Mechanics, kinematics, forces, energy</p>
          </Link>
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
            <h3 className="text-xl font-semibold mb-2 text-slate-500">Chemistry</h3>
            <p className="text-slate-600">Coming soon: stoichiometry, bonding, thermodynamics</p>
          </div>
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
            <h3 className="text-xl font-semibold mb-2 text-slate-500">Calculus II</h3>
            <p className="text-slate-600">Coming soon: integration, series, differential equations</p>
          </div>
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
            <h3 className="text-xl font-semibold mb-2 text-slate-500">Physics II</h3>
            <p className="text-slate-600">Coming soon: electricity, magnetism, waves</p>
          </div>
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
            <h3 className="text-xl font-semibold mb-2 text-slate-500">Calculus III</h3>
            <p className="text-slate-600">Coming soon: multivariable, vector calculus</p>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="border border-slate-200 rounded-2xl p-8 md:p-12 bg-slate-50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Try a demo quiz</h2>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto">
            Experience our platform with a sample quiz. Paste your Quiz ID and token, or start a public demo.
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <DemoLauncher />
        </div>
      </section>
    </div>
  );
}
