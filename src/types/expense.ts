export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'bills'
  | 'other'

export interface Expense {
  id: string
  amount: number
  description?: string
  category: ExpenseCategory
  date: string
}

