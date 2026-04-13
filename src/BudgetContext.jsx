import { createContext, useContext, useState, useEffect } from 'react'
import { useTrip } from './TripContext'

const BudgetContext = createContext()

export function BudgetProvider({ children }) {
  const { activeTripId } = useTrip()

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('wandr-budgets')
    return saved ? JSON.parse(saved) : {}
  })

  useEffect(() => {
    localStorage.setItem('wandr-budgets', JSON.stringify(budgets))
  }, [budgets])

  const key = activeTripId ? String(activeTripId) : null
  const budget = key && budgets[key] ? budgets[key] : { totalBudget: 9500, expenses: [] }

  function setBudget(newBudget) {
    if (!key) return
    setBudgets(prev => ({ ...prev, [key]: newBudget }))
  }

  function addExpense(expense) {
    setBudget({ ...budget, expenses: [...budget.expenses, { ...expense, id: Date.now() }] })
  }

  function deleteExpense(id) {
    setBudget({ ...budget, expenses: budget.expenses.filter(e => e.id !== id) })
  }

  function updateTotalBudget(amount) {
    setBudget({ ...budget, totalBudget: amount })
  }

  const totalSpent = budget.expenses.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0)
  const remaining = budget.totalBudget - totalSpent

  return (
    <BudgetContext.Provider value={{ budget, addExpense, deleteExpense, updateTotalBudget, totalSpent, remaining }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  return useContext(BudgetContext)
}
