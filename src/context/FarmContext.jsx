import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  crops as seedCrops,
  livestock as seedLivestock,
  flocks as seedFlocks,
  tasks as seedTasks,
  dailyLogs as seedLogs,
  healthRecords as seedHealth,
  sales as seedSales,
  expenses as seedExpenses,
  eggProduction as seedEggProduction,
} from '../data/mockData'

const FarmContext = createContext(null)

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = (userId) => `yieldflow_data_${userId}`

function loadUserData(userId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId))
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupted data — fall through to seed
  }
  return null
}

function saveUserData(userId, data) {
  try {
    localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(data))
  } catch {
    // storage quota exceeded — fail silently
  }
}

// The first registered account (id starts with "user_") gets empty arrays as
// its starting point. The legacy demo session (id === 1) keeps the real seed data
// so existing data isn't lost on first load after this upgrade.
function getInitialData(userId) {
  const saved = loadUserData(userId)
  if (saved) return saved

  // Legacy numeric id === 1 was the only id before this change — seed it with
  // the real farm data so the original account doesn't lose anything.
  const isLegacy = userId === 1 || userId === '1'
  return {
    crops:         isLegacy ? seedCrops         : [],
    livestock:     isLegacy ? seedLivestock     : [],
    flocks:        isLegacy ? seedFlocks        : [],
    tasks:         isLegacy ? seedTasks         : [],
    logs:          isLegacy ? seedLogs          : [],
    health:        isLegacy ? seedHealth        : [],
    salesData:     isLegacy ? seedSales         : [],
    expenseData:   isLegacy ? seedExpenses      : [],
    eggProduction: isLegacy ? seedEggProduction : [],
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function FarmProvider({ userId, children }) {
  const initial = getInitialData(userId)

  const [crops,         setCrops]         = useState(initial.crops)
  const [livestock,     setLivestock]     = useState(initial.livestock)
  const [flocks,        setFlocks]        = useState(initial.flocks)
  const [tasks,         setTasks]         = useState(initial.tasks)
  const [logs,          setLogs]          = useState(initial.logs)
  const [health,        setHealth]        = useState(initial.health)
  const [salesData,     setSalesData]     = useState(initial.salesData)
  const [expenseData,   setExpenseData]   = useState(initial.expenseData)
  const [eggProduction, setEggProduction] = useState(initial.eggProduction)

  // Persist the full state to localStorage whenever any slice changes.
  useEffect(() => {
    saveUserData(userId, {
      crops, livestock, flocks, tasks, logs,
      health, salesData, expenseData, eggProduction,
    })
  }, [userId, crops, livestock, flocks, tasks, logs, health, salesData, expenseData, eggProduction])

  // ─── Generic CRUD helpers ────────────────────────────────────────────────
  const addItem    = useCallback((setter) => (item) =>
    setter(prev => [...prev, { ...item, id: Date.now() }]), [])

  const updateItem = useCallback((setter) => (id, changes) =>
    setter(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i)), [])

  const deleteItem = useCallback((setter) => (id) =>
    setter(prev => prev.filter(i => i.id !== id)), [])

  return (
    <FarmContext.Provider value={{
      crops,
      addCrop:    addItem(setCrops),
      updateCrop: updateItem(setCrops),
      deleteCrop: deleteItem(setCrops),

      livestock,
      addAnimal:    addItem(setLivestock),
      updateAnimal: updateItem(setLivestock),
      deleteAnimal: deleteItem(setLivestock),

      flocks,
      addFlock:    addItem(setFlocks),
      updateFlock: updateItem(setFlocks),
      deleteFlock: deleteItem(setFlocks),

      tasks,
      addTask:    addItem(setTasks),
      updateTask: updateItem(setTasks),
      deleteTask: deleteItem(setTasks),

      logs,
      addLog:    addItem(setLogs),
      deleteLog: deleteItem(setLogs),

      health,
      addHealth:    addItem(setHealth),
      updateHealth: updateItem(setHealth),

      salesData,
      addSale:    addItem(setSalesData),
      deleteSale: deleteItem(setSalesData),

      expenseData,
      addExpense:    addItem(setExpenseData),
      deleteExpense: deleteItem(setExpenseData),

      eggProduction,
      addEggRecord: addItem(setEggProduction),
    }}>
      {children}
    </FarmContext.Provider>
  )
}

export const useFarm = () => useContext(FarmContext)
