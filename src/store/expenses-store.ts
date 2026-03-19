import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Expense, ExpenseCategory } from '../types/expense'

interface AddExpenseInput {
  amount: number
  description?: string
  category: ExpenseCategory
  date: string
}

interface ExpensesState {
  expenses: Expense[]
  monthlyBudget: number | null
  addExpense: (input: AddExpenseInput) => void
  removeExpense: (id: string) => void
  setMonthlyBudget: (amount: number) => void
}

export const useExpensesStore = create<ExpensesState>()(
  persist(
    (set) => ({
      expenses: [],
      monthlyBudget: null,
      addExpense: (input) =>
        set((state) => ({
          expenses: [
            {
              id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              ...input,
            },
            ...state.expenses,
          ],
        })),
      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        })),
      setMonthlyBudget: (amount) =>
        set(() => ({
          monthlyBudget: amount,
        })),
    }),
    {
      name: 'daily-expense-logger',
    },
  ),
)

