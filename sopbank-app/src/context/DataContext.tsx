import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { initDatabase } from '../lib/db'
import { currentMonth } from '../lib/utils'

type DataContextValue = {
  ready: boolean
  selectedMonth: string
  setSelectedMonth: (m: string) => void
  refreshKey: number
  refresh: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth())
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    initDatabase()
      .then(() => setReady(true))
      .catch((err) => console.error(err))
  }, [])

  const value = useMemo(
    () => ({
      ready,
      selectedMonth,
      setSelectedMonth,
      refreshKey,
      refresh,
    }),
    [ready, selectedMonth, refreshKey, refresh],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
