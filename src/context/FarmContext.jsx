import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─── Supabase schema note ─────────────────────────────────────────────────────
//
// Run this in the Supabase SQL editor to create all tables.
// Every table has a farm_id column so RLS can scope reads to the correct farm.
//
// -- Helper: enable RLS + create farm-scoped policy for a table
// -- (repeat for each table below)
//
// create table public.flocks (
//   id            uuid primary key default gen_random_uuid(),
//   farm_id       uuid not null,
//   name          text,
//   type          text,
//   breed         text,
//   count         integer default 0,
//   house         text,
//   purpose       text,
//   date_acquired date,
//   avg_weight    numeric,
//   status        text default 'Active',
//   mortality     integer default 0,
//   created_at    timestamptz default now()
// );
// alter table public.flocks enable row level security;
// create policy "flocks: farm access" on public.flocks
//   using  (farm_id = (select farm_id from profiles where id = auth.uid()))
//   with check (farm_id = (select farm_id from profiles where id = auth.uid()));
//
// -- Repeat the same pattern for:
// --   crops, livestock, tasks, daily_logs, health_records,
// --   sales, expenses, egg_production
//
// -- crops: id, farm_id, name, type, field, status, planted_date, expected_harvest,
// --        actual_harvest, yield_kg, notes, created_at
//
// -- livestock: id, farm_id, tag, name, type, breed, age, weight, status,
// --            date_acquired, notes, created_at
//
// -- tasks: id, farm_id, title, category, priority, due_date, assignee,
// --        status, notes, created_at
//
// -- daily_logs: id, farm_id, date, category, title, description, author, created_at
//
// -- health_records: id, farm_id, date, animal, type, diagnosis, treatment,
// --                 vet, cost, follow_up, status, created_at
//
// -- sales: id, farm_id, date, product, quantity, unit, unit_price, total,
// --        buyer, payment_status, created_at
//
// -- expenses: id, farm_id, date, category, description, amount, qty,
// --           unit_price, slot, vendor, payment_method, created_at
//
// -- egg_production: id, farm_id, date, eggs_collected, broken, marketable, created_at
//
// ─────────────────────────────────────────────────────────────────────────────

const FarmContext = createContext(null)

// Map our internal camelCase field names to Supabase snake_case column names
// for tables where the naming diverges from JS convention.
const COLUMN_MAP = {
  flocks: {
    dateAcquired: 'date_acquired',
    avgWeight:    'avg_weight',
  },
  tasks: {
    dueDate:  'due_date',
  },
  daily_logs: {
    // all match
  },
  health_records: {
    followUp: 'follow_up',
  },
  sales: {
    unitPrice:     'unit_price',
    paymentStatus: 'payment_status',
  },
  expenses: {
    unitPrice:     'unit_price',
    paymentMethod: 'payment_method',
  },
  egg_production: {
    eggsCollected: 'eggs_collected',
  },
}

// Convert a JS object with camelCase keys to Supabase snake_case for a given table
function toDb(table, obj) {
  const map = COLUMN_MAP[table] || {}
  const result = {}
  for (const [k, v] of Object.entries(obj)) {
    result[map[k] || camelToSnake(k)] = v
  }
  return result
}

// Convert a Supabase row (snake_case) back to camelCase for React state
function fromDb(row) {
  const result = {}
  for (const [k, v] of Object.entries(row)) {
    result[snakeToCamel(k)] = v
  }
  return result
}

function camelToSnake(s) {
  return s.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)
}

function snakeToCamel(s) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function FarmProvider({ farmId, children }) {
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const [crops,         setCrops]         = useState([])
  const [livestock,     setLivestock]     = useState([])
  const [flocks,        setFlocks]        = useState([])
  const [tasks,         setTasks]         = useState([])
  const [logs,          setLogs]          = useState([])
  const [health,        setHealth]        = useState([])
  const [salesData,     setSalesData]     = useState([])
  const [expenseData,   setExpenseData]   = useState([])
  const [eggProduction, setEggProduction] = useState([])

  // ─── Load all farm data when farmId becomes available ──────────────────────
  useEffect(() => {
    if (!farmId) return
    let cancelled = false

    async function fetchAll() {
      setLoading(true)
      setError(null)
      try {
        const tables = [
          ['crops',          setCrops],
          ['livestock',      setLivestock],
          ['flocks',         setFlocks],
          ['tasks',          setTasks],
          ['daily_logs',     setLogs],
          ['health_records', setHealth],
          ['sales',          setSalesData],
          ['expenses',       setExpenseData],
          ['egg_production', setEggProduction],
        ]

        await Promise.all(
          tables.map(async ([table, setter]) => {
            const { data, error: err } = await supabase
              .from(table)
              .select('*')
              .eq('farm_id', farmId)
              .order('created_at', { ascending: false })

            if (err) throw new Error(`${table}: ${err.message}`)
            if (!cancelled) setter((data || []).map(fromDb))
          })
        )
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [farmId])

  // ─── Generic CRUD helpers ──────────────────────────────────────────────────

  const addItem = useCallback((table, setter) => async (item) => {
    const { farm_id, ...rest } = { farm_id: farmId, ...toDb(table, item) }
    const { data, error: err } = await supabase
      .from(table)
      .insert({ farm_id, ...rest })
      .select()
      .single()

    if (err) { console.error('addItem', table, err.message); return null }
    setter(prev => [fromDb(data), ...prev])
    return fromDb(data)
  }, [farmId])

  const updateItem = useCallback((table, setter) => async (id, changes) => {
    const { data, error: err } = await supabase
      .from(table)
      .update(toDb(table, changes))
      .eq('id', id)
      .eq('farm_id', farmId)
      .select()
      .single()

    if (err) { console.error('updateItem', table, err.message); return }
    setter(prev => prev.map(i => i.id === id ? fromDb(data) : i))
  }, [farmId])

  const deleteItem = useCallback((table, setter) => async (id) => {
    const { error: err } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('farm_id', farmId)

    if (err) { console.error('deleteItem', table, err.message); return }
    setter(prev => prev.filter(i => i.id !== id))
  }, [farmId])

  return (
    <FarmContext.Provider value={{
      loading,
      error,

      crops,
      addCrop:    addItem('crops',    setCrops),
      updateCrop: updateItem('crops', setCrops),
      deleteCrop: deleteItem('crops', setCrops),

      livestock,
      addAnimal:    addItem('livestock',    setLivestock),
      updateAnimal: updateItem('livestock', setLivestock),
      deleteAnimal: deleteItem('livestock', setLivestock),

      flocks,
      addFlock:    addItem('flocks',    setFlocks),
      updateFlock: updateItem('flocks', setFlocks),
      deleteFlock: deleteItem('flocks', setFlocks),

      tasks,
      addTask:    addItem('tasks',    setTasks),
      updateTask: updateItem('tasks', setTasks),
      deleteTask: deleteItem('tasks', setTasks),

      logs,
      addLog:    addItem('daily_logs',    setLogs),
      deleteLog: deleteItem('daily_logs', setLogs),

      health,
      addHealth:    addItem('health_records',    setHealth),
      updateHealth: updateItem('health_records', setHealth),

      salesData,
      addSale:    addItem('sales',    setSalesData),
      deleteSale: deleteItem('sales', setSalesData),

      expenseData,
      addExpense:    addItem('expenses',    setExpenseData),
      deleteExpense: deleteItem('expenses', setExpenseData),

      eggProduction,
      addEggRecord: addItem('egg_production', setEggProduction),
    }}>
      {children}
    </FarmContext.Provider>
  )
}

export const useFarm = () => useContext(FarmContext)
