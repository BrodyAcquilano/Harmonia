import { useState } from 'react'
import NotesView from './components/NotesView.jsx'
import WaveLab from './components/WaveLab.jsx'
import QuarkSpace from './components/QuarkSpace.jsx'

export default function App() {
  const [tab, setTab] = useState('lab')

  return (
    <div className="app">
      <header className="header">
        <h1>Harmonium</h1>
        <nav className="tabs">
          <button
            className={tab === 'lab' ? 'active' : ''}
            onClick={() => setTab('lab')}
          >
            Wave Lab
          </button>
          <button
            className={tab === 'quark' ? 'active' : ''}
            onClick={() => setTab('quark')}
          >
            Quark Space
          </button>
          <button
            className={tab === 'notes' ? 'active' : ''}
            onClick={() => setTab('notes')}
          >
            Notes
          </button>
        </nav>
      </header>
      <main>{tab === 'lab' ? <WaveLab /> : tab === 'quark' ? <QuarkSpace /> : <NotesView />}</main>
    </div>
  )
}
