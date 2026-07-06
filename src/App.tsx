import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav, type ViewName } from './components/BottomNav'
import { LibraryView } from './views/LibraryView'
import { SortView } from './views/SortView'
import { SuggestionsView } from './views/SuggestionsView'
import { MemoriesView } from './views/MemoriesView'
import { AlbumsView } from './views/AlbumsView'
import { SettingsView } from './views/SettingsView'
import { usePhotosByStatus } from './hooks/usePhotos'
import { UndoProvider } from './context/UndoContext'

const views: Record<ViewName, React.ComponentType> = {
  library: LibraryView,
  sort: SortView,
  suggestions: SuggestionsView,
  memories: MemoriesView,
  albums: AlbumsView,
  settings: SettingsView,
}

function App() {
  const [view, setView] = useState<ViewName>('library')
  const [showSettings, setShowSettings] = useState(false)
  const inbox = usePhotosByStatus(['inbox'])

  const ActiveView = showSettings ? SettingsView : views[view]

  return (
    <UndoProvider>
      <div className="flex min-h-dvh flex-col">
        <div className="grain" />

        <button
          type="button"
          onClick={() => setShowSettings((v) => !v)}
          aria-label="Instellingen en privacy"
          className="fixed right-3 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface)]/80 text-sm text-[var(--color-mist)] backdrop-blur"
          style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          {showSettings ? '✕' : '⚙'}
        </button>

        <AnimatePresence mode="wait">
          <motion.main
            key={showSettings ? 'settings' : view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col"
          >
            <ActiveView />
          </motion.main>
        </AnimatePresence>

        {!showSettings && (
          <BottomNav
            active={view}
            onChange={setView}
            badgeCounts={{ sort: inbox?.length }}
          />
        )}
      </div>
    </UndoProvider>
  )
}

export default App
