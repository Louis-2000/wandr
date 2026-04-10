import { createContext, useContext, useState, useEffect } from 'react'

const BudgetContext = createContext()

export function BudgetProvider({ children }) {
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('wandr-budget')
    return saved ? JSON.parse(saved) : {
      totalBudget: 9500,
      expenses: [],
    }
  })

  useEffect(() => {
    localStorage.setItem('wandr-budget', JSON.stringify(budget))
  }, [budget])

  function addExpense(expense) {
    setBudget(prev => ({
      ...prev,
      expenses: [...prev.expenses, { ...expense, id: Date.now() }]
    }))
  }

  function deleteExpense(id) {
    setBudget(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }))
  }

  function updateTotalBudget(amount) {
    setBudget(prev => ({ ...prev, totalBudget: amount }))
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