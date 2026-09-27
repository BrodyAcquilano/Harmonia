import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

// Notes live in /notes as plain markdown files; Vite inlines them as strings.
const noteModules = import.meta.glob('../../notes/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function titleFromPath(path) {
  const base = path.split('/').pop().replace(/\.md$/, '')
  return base
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function NotesView() {
  const notes = useMemo(
    () =>
      Object.entries(noteModules)
        .map(([path, text]) => ({ path, title: titleFromPath(path), text }))
        .sort((a, b) => a.title.localeCompare(b.title)),
    []
  )
  const [active, setActive] = useState(notes[0]?.path)
  const current = notes.find((n) => n.path === active) || notes[0]

  return (
    <div className="notes-layout">
      <aside className="notes-sidebar">
        {notes.map((n) => (
          <button
            key={n.path}
            className={n.path === current?.path ? 'active' : ''}
            onClick={() => setActive(n.path)}
          >
            {n.title}
          </button>
        ))}
      </aside>
      <article className="note-body">
        {current && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {current.text}
          </ReactMarkdown>
        )}
      </article>
    </div>
  )
}
