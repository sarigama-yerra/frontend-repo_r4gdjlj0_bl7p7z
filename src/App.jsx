import { Link } from 'react-router-dom'
import Editor from './components/Editor'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-500" />
            <h1 className="text-xl font-bold">Gamma-Style Builder</h1>
          </div>
          <nav className="flex items-center gap-4 text-slate-300">
            <Link to="/" className="hover:text-white">Create</Link>
            <a href="/test" className="hover:text-white">System</a>
          </nav>
        </header>
        <Editor />
      </div>
    </div>
  )
}

export default App
