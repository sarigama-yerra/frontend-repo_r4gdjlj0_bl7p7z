import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function ThemeWrapper({ theme, children }) {
  if (theme === 'dark') {
    return <div className="min-h-screen bg-slate-900 text-white">{children}</div>
  }
  if (theme === 'gradient') {
    return <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">{children}</div>
  }
  return <div className="min-h-screen bg-white text-slate-900">{children}</div>
}

export default function Viewer() {
  const [data, setData] = useState(null)
  const slug = window.location.pathname.split('/p/')[1]

  useEffect(() => {
    const run = async () => {
      const r = await fetch(`${API_BASE}/p/${slug}`)
      if (r.ok) setData(await r.json())
    }
    if (slug) run()
  }, [slug])

  if (!slug) return <div className="p-10">Missing slug</div>
  if (!data) return <div className="p-10 text-slate-500">Loading...</div>

  const { project, blocks } = data

  return (
    <ThemeWrapper theme={project.theme}>
      <div className="max-w-4xl mx-auto p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">{project.title}</h1>
        </header>
        <main className="space-y-6">
          {blocks.map(b => (
            <div key={b.id}>
              {b.type === 'heading' && (
                <h2 className="text-2xl font-semibold">{b.content || 'Heading'}</h2>
              )}
              {b.type === 'text' && (
                <p className="leading-7 text-lg whitespace-pre-wrap">{b.content || 'Text'}</p>
              )}
              {b.type === 'image' && (
                <img src={b.content} alt="" className="w-full rounded-lg border" />
              )}
            </div>
          ))}
        </main>
      </div>
    </ThemeWrapper>
  )
}
