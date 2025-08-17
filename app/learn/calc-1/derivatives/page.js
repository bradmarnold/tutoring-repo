import Link from "next/link";

export default function DerivativesPage() {
  const concepts = [
    {
      id: "limits",
      title: "Limits",
      description: "The foundation of calculus - understanding what happens as we approach a value",
      topics: ["Definition of a limit", "One-sided limits", "Limit laws", "Continuity"]
    },
    {
      id: "derivative-definition", 
      title: "Definition of Derivative",
      description: "From limits to slopes - the formal definition and geometric interpretation",
      topics: ["Difference quotient", "Instantaneous rate of change", "Tangent lines", "Differentiability"]
    },
    {
      id: "basic-rules",
      title: "Basic Derivative Rules", 
      description: "Power rule, constant rule, sum and difference rules",
      topics: ["Power rule", "Constant multiple rule", "Sum/difference rules", "Practice problems"]
    },
    {
      id: "product-quotient",
      title: "Product & Quotient Rules",
      description: "More complex derivative rules for products and quotients of functions",
      topics: ["Product rule", "Quotient rule", "When to use each", "Common mistakes"]
    },
    {
      id: "chain-rule",
      title: "Chain Rule",
      description: "The most important rule - derivatives of composite functions",
      topics: ["Composite functions", "Chain rule formula", "Multiple compositions", "Applications"]
    },
    {
      id: "implicit",
      title: "Implicit Differentiation",
      description: "Finding derivatives when y isn't isolated",
      topics: ["Implicit vs explicit", "Related rates", "Logarithmic differentiation", "Applications"]
    },
    {
      id: "optimization",
      title: "Optimization",
      description: "Using derivatives to find maximum and minimum values",
      topics: ["Critical points", "First derivative test", "Second derivative test", "Applied optimization"]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <nav className="text-sm text-slate-600">
          <Link href="/learn" className="hover:text-slate-900">Learn</Link>
          <span className="mx-2">/</span>
          <span>Calculus I: Derivatives</span>
        </nav>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">Calculus I: Derivatives</h1>
          <p className="text-lg text-slate-700">
            Master the fundamental concept of derivatives through clear explanations and focused practice.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {concepts.map((concept, index) => (
          <div key={concept.id} className="border border-slate-200 rounded-2xl p-6 hover:bg-slate-50 transition-colors">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
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

      {/* Checkpoint Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Ready for a checkpoint?</h2>
          <p className="text-slate-700 max-w-2xl mx-auto">
            Test your understanding of derivatives with a practice quiz. Get instant feedback and explanations for every question.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/#demo" 
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Take Practice Quiz
            </Link>
            <a 
              href="mailto:bradfordm.arnold@gmail.com" 
              className="px-6 py-3 border border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Book Tutoring Session
            </a>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold text-slate-900">Need more help?</h3>
        <p className="text-slate-700">
          Get personalized guidance and custom practice problems tailored to your needs.
        </p>
        <Link 
          href="/learn" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to all units
        </Link>
      </div>
    </div>
  );
}