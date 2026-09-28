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

// Display order of the notes, first to last.
const NOTE_ORDER = [
  '../../notes/symmetric-inertia-transfer.md',
  '../../notes/lambda-derivation.md',
  '../../notes/decay-and-amplitude.md',
  '../../notes/hidden-phasor.md',
  '../../notes/keplers-laws.md',
  '../../notes/quantum-tech-stack.md',
]

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
      NOTE_ORDER.map((path) => ({
        path,
        title: titleFromPath(path),
        text: noteModules[path],
      })).filter((n) => n.text),
    []
  )
  const [active, setActive] = useState(notes[0]?.path)
  const current = notes.find((n) => n.path === active) || notes[0]

  return (
    <div className="notes-layout">
      <aside className="notes-sidebar">
        <h3 className="notes-sidebar-title">Notebook</h3>
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
