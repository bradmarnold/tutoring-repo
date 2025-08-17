import Link from "next/link";

export default function KinematicsPage() {
  const concepts = [
    {
      id: "1d-motion",
      title: "One-Dimensional Motion",
      description: "Motion along a straight line - position, velocity, and acceleration",
      topics: ["Position vs displacement", "Velocity vs speed", "Acceleration", "Kinematic equations"]
    },
    {
      id: "graphs",
      title: "Motion Graphs", 
      description: "Understanding position-time, velocity-time, and acceleration-time graphs",
      topics: ["Position-time graphs", "Velocity-time graphs", "Acceleration-time graphs", "Reading slopes and areas"]
    },
    {
      id: "free-fall",
      title: "Free Fall",
      description: "Motion under constant acceleration due to gravity",
      topics: ["Acceleration due to gravity", "Objects dropped vs thrown", "Maximum height", "Time of flight"]
    },
    {
      id: "2d-motion",
      title: "Two-Dimensional Motion",
      description: "Motion in a plane - projectile motion and circular motion basics",
      topics: ["Vector components", "Independence of x and y motion", "Projectile motion", "Range and trajectory"]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <nav className="text-sm text-slate-600">
          <Link href="/learn" className="hover:text-slate-900">Learn</Link>
          <span className="mx-2">/</span>
          <span>Physics I: Kinematics</span>
        </nav>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Physics I: Kinematics</h1>
          <p className="text-lg text-slate-700">
            Understand motion through position, velocity, and acceleration. Build the foundation for all of mechanics.
          </p>
        </div>
      </div>

      {/* Key Concepts */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Key Concepts</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-green-800">Position</h3>
            <p className="text-slate-700">Where an object is located in space</p>
          </div>
          <div>
            <h3 className="font-semibold text-green-800">Velocity</h3>  
            <p className="text-slate-700">Rate of change of position</p>
          </div>
          <div>
            <h3 className="font-semibold text-green-800">Acceleration</h3>
            <p className="text-slate-700">Rate of change of velocity</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {concepts.map((concept, index) => (
          <div key={concept.id} className="border border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition-colors">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-semibold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{concept.title}</h3>
                  <p className="text-slate-700 mb-3">{concept.description}</p>
                  <ul className="space-y-1">
                    {concept.topics.map(topic => (
                      <li key={topic} className="text-sm text-slate-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Essential Equations */}
      <div className="border border-slate-200 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Essential Equations</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm font-mono bg-slate-50 p-4 rounded-xl">
          <div className="space-y-2">
            <div>v = v₀ + at</div>
            <div>x = x₀ + v₀t + ½at²</div>
          </div>
          <div className="space-y-2">
            <div>v² = v₀² + 2a(x - x₀)</div>
            <div>x = x₀ + ½(v₀ + v)t</div>
          </div>
        </div>
        <p className="text-xs text-slate-600 mt-2">
          These kinematic equations apply when acceleration is constant
        </p>
      </div>

      {/* Checkpoint Section */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Ready for a checkpoint?</h2>
          <p className="text-slate-700 max-w-2xl mx-auto">
            Test your understanding of kinematics with problems covering 1D motion, graphs, and projectiles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/#demo" 
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Take Practice Quiz
            </Link>
            <a 
              href="mailto:bradfordm.arnold@gmail.com" 
              className="px-6 py-3 border border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors"
            >
              Book Tutoring Session
            </a>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">Need more practice?</h3>
        <p className="text-slate-700">
          Get personalized problem sets and step-by-step guidance for challenging concepts.
        </p>
        <Link 
          href="/learn" 
          className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
        >
          ← Back to all units
        </Link>
      </div>
    </div>
  );
}