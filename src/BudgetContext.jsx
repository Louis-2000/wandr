import { createContext, useContext, useState, useEffect } from 'react'
import { useTrip } from './TripContext'
import { fetchExpenses, createExpenseDB, deleteExpenseDB } from './db'

const BudgetContext = createContext()

export function BudgetProvider({ children }) {
  const { activeTripId } = useTrip()
  const [expenses, setExpenses] = useState([])
  const [totalBudget, setTotalBudgetState] = useState(9500)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!activeTripId) {
      setExpenses([])
      return
    }
    loadExpenses()
    const saved = localStorage.getItem(`wandr-budget-${activeTripId}`)
    if (saved) setTotalBudgetState(parseInt(saved))
  }, [activeTripId])

  async function loadExpenses() {
    setLoading(true)
    try {
      const data = await fetchExpenses(activeTripId)
      setExpenses(data.map(e => ({
        id: e.id,
        description: e.description,
        amount: e.amount,
        category: e.category,
        stop: e.stop_name,
        date: e.date,
      })))
    } catch (err) {
      console.error('Error loading expenses:', err)
    } finally {
      setLoading(false)
    }
  }

  async function addExpense(expense) {
    try {
      const data = await createExpenseDB({
        tripId: activeTripId,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        stopName: expense.stop,
        date: expense.date,
      })
      setExpenses(prev => [{
        id: data.id,
        description: data.description,
        amount: data.amount,
        category: data.category,
        stop: data.stop_name,
        date: data.date,
      }, ...prev])
    } catch (err) {
      console.error('Error adding expense:', err)
    }
  }

  async function deleteExpense(id) {
    try {
      await deleteExpenseDB(id)
      setExpenses(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      console.error('Error deleting expense:', err)
    }
  }

  function updateTotalBudget(amount) {
    setTotalBudgetState(amount)
    if (activeTripId) {
      localStorage.setItem(`wandr-budget-${activeTripId}`, amount.toString())
    }
  }

  const budget = { totalBudget, expenses }
  const totalSpent = expenses.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0)
  const remaining = totalBudget - totalSpent

  return (
    <BudgetContext.Provider value={{ budget, addExpense, deleteExpense, updateTotalBudget, totalSpent, remaining, loading }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  return useContext(BudgetContext)
}
