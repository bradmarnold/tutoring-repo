import Link from "next/link";

export default function LearnPage() {
  const units = [
    {
      id: "calc-1-derivatives",
      title: "Calculus I: Derivatives",
      description: "Limits, derivative rules, chain rule, implicit differentiation, optimization",
      href: "/learn/calc-1/derivatives",
      status: "available",
      topics: ["Limits", "Power Rule", "Chain Rule", "Optimization"]
    },
    {
      id: "phys-1-kinematics", 
      title: "Physics I: Kinematics",
      description: "Motion in 1D and 2D, velocity, acceleration, projectile motion",
      href: "/learn/phys-1/kinematics",
      status: "available",
      topics: ["1D Motion", "2D Motion", "Projectiles", "Free Fall"]
    },
    {
      id: "calc-1-integration",
      title: "Calculus I: Integration", 
      description: "Antiderivatives, definite integrals, area under curves",
      href: "/learn/calc-1/integration",
      status: "coming-soon",
      topics: ["Antiderivatives", "Fundamental Theorem", "Area", "Volume"]
    },
    {
      id: "phys-1-forces",
      title: "Physics I: Forces",
      description: "Newton's laws, friction, tension, circular motion",
      href: "/learn/phys-1/forces",
      status: "coming-soon", 
      topics: ["Newton's Laws", "Friction", "Tension", "Circular Motion"]
    },
    {
      id: "calc-2-series",
      title: "Calculus II: Series",
      description: "Infinite series, convergence tests, Taylor series",
      href: "/learn/calc-2/series",
      status: "coming-soon",
      topics: ["Convergence", "Power Series", "Taylor Series", "Applications"]
    },
    {
      id: "phys-2-electricity",
      title: "Physics II: Electricity",
      description: "Electric fields, potential, circuits, capacitors",
      href: "/learn/phys-2/electricity", 
      status: "coming-soon",
      topics: ["Electric Fields", "Potential", "Circuits", "Capacitors"]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">Learning Units</h1>
        <p className="text-lg text-slate-700 max-w-2xl mx-auto">
          Master concepts through structured lessons and practice problems. Each unit includes checkpoints to test your understanding.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {units.map(unit => (
          <div key={unit.id} className={`border rounded-2xl p-6 ${
            unit.status === 'available' 
              ? 'hover:bg-slate-50 cursor-pointer' 
              : 'bg-slate-50'
          }`}>
            {unit.status === 'available' ? (
              <Link href={unit.href} className="block">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600">
                      {unit.title}
                    </h2>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Available
                    </span>
                  </div>
                  <p className="text-slate-700">{unit.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {unit.topics.map(topic => (
                      <span key={topic} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold text-slate-500">
                    {unit.title}
                  </h2>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                    Coming Soon
                  </span>
                </div>
                <p className="text-slate-600">{unit.description}</p>
                <div className="flex flex-wrap gap-2">
                  {unit.topics.map(topic => (
                    <span key={topic} className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-lg">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center space-y-4 pt-8">
        <h2 className="text-2xl font-semibold text-slate-900">Ready to get started?</h2>
        <p className="text-slate-700">
          Book a session to get personalized quizzes and one-on-one guidance.
        </p>
        <a 
          href="mailto:bradfordm.arnold@gmail.com" 
          className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
        >
          Book a Session
        </a>
      </div>
    </div>
  );
}