"use client";
import { useEffect, useState } from "react";

export default function Templates(){
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    topic: '',
    q: ''
  });

  useEffect(() => {
    loadTemplates();
  }, [filters]);

  async function loadTemplates() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.topic) params.set('topic', filters.topic);
      if (filters.q) params.set('q', filters.q);

      const r = await fetch(`/api/admin/templates/list?${params}`);
      if (r.ok) {
        const data = await r.json();
        setTemplates(data.templates || []);
      } else {
        console.error("Failed to load templates");
      }
    } catch (e) {
      console.error("Failed to load templates:", e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const r = await fetch("/api/admin/templates/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      
      if (r.ok) {
        loadTemplates(); // Refresh list
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      alert("Failed to update status");
    }
  }

  async function previewTemplate(id) {
    try {
      const r = await fetch("/api/admin/templates/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: id, n: 2 })
      });
      
      if (r.ok) {
        const data = await r.json();
        console.log("Preview:", data);
        alert(`Preview generated! Check console for ${data.samples.length} samples.`);
      } else {
        alert("Failed to generate preview");
      }
    } catch (e) {
      alert("Failed to generate preview");
    }
  }

  async function publishTemplate(id) {
    if (!confirm("This will generate 20 question variants. Continue?")) return;
    
    try {
      const r = await fetch("/api/admin/templates/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, howMany: 20 })
      });
      
      if (r.ok) {
        const data = await r.json();
        alert(`Success! Generated ${data.variants_created} variants.`);
        loadTemplates();
      } else {
        const error = await r.json().catch(() => ({}));
        alert(`Failed to publish: ${error.error || 'Unknown error'}`);
      }
    } catch (e) {
      alert("Failed to publish template");
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Question Templates</h1>
        <a href="/admin/templates/new" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          New Template
        </a>
      </div>
      
      {/* Filters */}
      <div className="border rounded-xl p-4 space-y-3">
        <h2 className="font-medium">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select 
              className="border rounded p-2 w-full" 
              value={filters.status} 
              onChange={e => setFilters(prev => ({...prev, status: e.target.value}))}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Topic</label>
            <input 
              className="border rounded p-2 w-full" 
              placeholder="e.g., calc1-derivatives"
              value={filters.topic} 
              onChange={e => setFilters(prev => ({...prev, topic: e.target.value}))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input 
              className="border rounded p-2 w-full" 
              placeholder="Title or TEKS code..."
              value={filters.q} 
              onChange={e => setFilters(prev => ({...prev, q: e.target.value}))}
            />
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="border rounded-xl p-4">
        <h2 className="font-medium mb-3">Templates ({templates.length})</h2>
        
        {loading ? (
          <div className="text-center py-8">Loading templates...</div>
        ) : templates.length === 0 ? (
          <p className="text-slate-600 text-center py-8">
            No templates found. Create your first template using the "New Template" button.
          </p>
        ) : (
          <div className="space-y-3">
            {templates.map(t => (
              <div key={t.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{t.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(t.status)}`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      {t.topics?.course} • {t.topics?.unit} • {t.difficulty}
                      {t.teks_code && <span> • TEKS: {t.teks_code}</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Updated: {new Date(t.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {t.status === 'draft' && (
                      <button 
                        onClick={() => updateStatus(t.id, 'review')}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                      >
                        → Review
                      </button>
                    )}
                    
                    {t.status === 'review' && (
                      <button 
                        onClick={() => updateStatus(t.id, 'published')}
                        className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                      >
                        → Publish
                      </button>
                    )}
                    
                    <button 
                      onClick={() => previewTemplate(t.id)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      Preview
                    </button>
                    
                    {(t.status === 'published' || t.status === 'review') && (
                      <button 
                        onClick={() => publishTemplate(t.id)}
                        className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                      >
                        Generate 20
                      </button>
                    )}
                    
                    <a 
                      href={`/admin/templates/${t.id}`}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    >
                      Edit
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}