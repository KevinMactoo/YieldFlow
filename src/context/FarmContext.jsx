import { createContext, useContext, useState } from 'react'
import {
  crops as initialCrops,
  livestock as initialLivestock,
  flocks as initialFlocks,
  tasks as initialTasks,
  dailyLogs as initialLogs,
  healthRecords as initialHealth,
  sales as initialSales,
  expenses as initialExpenses,
  eggProduction as initialEggProduction,
} from '../data/mockData'

const FarmContext = createContext(null)

export function FarmProvider({ children }) {
  const [crops, setCrops] = useState(initialCrops)
  const [livestock, setLivestock] = useState(initialLivestock)
  const [flocks, setFlocks] = useState(initialFlocks)
  const [tasks, setTasks] = useState(initialTasks)
  const [logs, setLogs] = useState(initialLogs)
  const [health, setHealth] = useState(initialHealth)
  const [salesData, setSalesData] = useState(initialSales)
  const [expenseData, setExpenseData] = useState(initialExpenses)
  const [eggProduction, setEggProduction] = useState(initialEggProduction)

  // Generic add/update/delete helpers
  const addItem = (setter) => (item) => setter(prev => [...prev, { ...item, id: Date.now() }])
  const updateItem = (setter) => (id, changes) =>
    setter(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i))
  const deleteItem = (setter) => (id) =>
    setter(prev => prev.filter(i => i.id !== id))

  return (
    <FarmContext.Provider value={{
      crops, addCrop: addItem(setCrops), updateCrop: updateItem(setCrops), deleteCrop: deleteItem(setCrops),
      livestock, addAnimal: addItem(setLivestock), updateAnimal: updateItem(setLivestock), deleteAnimal: deleteItem(setLivestock),
      flocks, addFlock: addItem(setFlocks), updateFlock: updateItem(setFlocks), deleteFlock: deleteItem(setFlocks),
      tasks, addTask: addItem(setTasks), updateTask: updateItem(setTasks), deleteTask: deleteItem(setTasks),
      logs, addLog: addItem(setLogs), deleteLog: deleteItem(setLogs),
      health, addHealth: addItem(setHealth), updateHealth: updateItem(setHealth),
      salesData, addSale: addItem(setSalesData), deleteSale: deleteItem(setSalesData),
      expenseData, addExpense: addItem(setExpenseData), deleteExpense: deleteItem(setExpenseData),
      eggProduction, addEggRecord: addItem(setEggProduction),
    }}>
      {children}
    </FarmContext.Provider>
  )
}

export const useFarm = () => useContext(FarmContext)
