import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function BlockItem({ block, onChange, onDelete }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        <select
          value={block.type}
          onChange={(e) => onChange({ ...block, type: e.target.value })}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="heading">Heading</option>
          <option value="text">Text</option>
          <option value="image">Image</option>
        </select>
        <span className="text-xs text-slate-500">Order</span>
        <input
          type="number"
          value={block.order}
          onChange={(e) => onChange({ ...block, order: parseInt(e.target.value || '0', 10) })}
          className="w-20 border rounded px-2 py-1 text-sm"
        />
        <button onClick={() => onDelete(block)} className="ml-auto text-red-600 text-sm hover:underline">Delete</button>
      </div>
      {block.type === 'image' ? (
        <input
          placeholder="Image URL"
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      ) : (
        <textarea
          placeholder={block.type === 'heading' ? 'Heading text' : 'Write text...'}
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          className="w-full border rounded px-3 py-2 min-h-[80px]"
        />
      )}
    </div>
  )
}

export default function Editor() {
  const [projects, setProjects] = useState([])
  const [current, setCurrent] = useState(null)
  const [title, setTitle] = useState('')
  const [theme, setTheme] = useState('light')
  const [blocks, setBlocks] = useState([])
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    const res = await fetch(`${API_BASE}/api/projects`)
    const data = await res.json()
    setProjects(data)
    if (!current && data[0]) {
      selectProject(data[0])
    }
  }

  const selectProject = async (proj) => {
    setCurrent(proj)
    setTitle(proj.title)
    setTheme(proj.theme)
    const r = await fetch(`${API_BASE}/api/blocks/${proj.id}`)
    const b = await r.json()
    setBlocks(b)
    setSlug(proj.slug || '')
  }

  const createProject = async () => {
    setSaving(true)
    const res = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title || 'Untitled', kind: 'presentation', theme })
    })
    const data = await res.json()
    setSaving(false)
    await loadProjects()
    const created = { id: data.id, title: title || 'Untitled', theme }
    const found = (await (await fetch(`${API_BASE}/api/projects`)).json()).find(p => p.id === data.id)
    if (found) selectProject(found)
  }

  const addBlock = async (type) => {
    if (!current) return
    const order = blocks.length ? Math.max(...blocks.map(b => b.order || 0)) + 1 : 0
    const res = await fetch(`${API_BASE}/api/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: current.id, type, content: '', order })
    })
    await selectProject(current)
  }

  const updateBlockLocal = (b) => {
    setBlocks(prev => prev.map(x => x.id === b.id ? b : x))
  }

  const deleteBlockLocal = async (b) => {
    // For MVP, just remove locally (no backend delete endpoint yet)
    setBlocks(prev => prev.filter(x => x.id !== b.id))
  }

  const publish = async () => {
    if (!current || !slug) return
    setSaving(true)
    const res = await fetch(`${API_BASE}/api/projects/${current.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug })
    })
    setSaving(false)
    if (res.ok) {
      alert(`Published at ${window.location.origin}/p/${slug}`)
    } else {
      const d = await res.json()
      alert(d.detail || 'Failed to publish')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Creator</h1>
          <a href="/" className="text-slate-300 hover:text-white">Home</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex gap-2">
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Project title" className="flex-1 bg-transparent border border-white/20 rounded px-3 py-2" />
                <button onClick={createProject} disabled={saving} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded">New</button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <label className="text-sm text-slate-300">Theme</label>
                <select value={theme} onChange={e=>setTheme(e.target.value)} className="bg-transparent border border-white/20 rounded px-2 py-1 text-sm">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="gradient">Gradient</option>
                </select>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Projects</h3>
              <div className="space-y-2 max-h-72 overflow-auto pr-1">
                {projects.map(p => (
                  <button key={p.id} onClick={() => selectProject(p)} className={`w-full text-left px-3 py-2 rounded border ${current?.id===p.id?'bg-blue-600/30 border-blue-400':'bg-white/5 border-white/10'} hover:bg-white/10`}>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-slate-300">{p.theme}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Publish</h3>
              <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="your-slug" className="w-full bg-transparent border border-white/20 rounded px-3 py-2 mb-2" />
              <button onClick={publish} disabled={!current || !slug || saving} className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded">Publish</button>
              {slug && (
                <a className="block text-center mt-2 text-blue-300 hover:underline" href={`/p/${slug}`} target="_blank">View public page</a>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="flex gap-2">
              <button onClick={()=>addBlock('heading')} className="px-3 py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20">Add Heading</button>
              <button onClick={()=>addBlock('text')} className="px-3 py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20">Add Text</button>
              <button onClick={()=>addBlock('image')} className="px-3 py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20">Add Image</button>
            </div>

            <div className="space-y-3">
              {blocks.map(b => (
                <BlockItem key={b.id} block={b} onChange={updateBlockLocal} onDelete={deleteBlockLocal} />
              ))}
              {blocks.length===0 && (
                <div className="text-slate-400 text-sm">No content yet. Add blocks to start.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
