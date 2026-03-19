import type { Expense } from '../types/expense'

type Scope = 'this-month' | 'all-time'

const CATEGORY_LABEL: Record<Expense['category'], string> = {
  food: 'Food',
  transport: 'Transport',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  health: 'Health',
  education: 'Education',
  bills: 'Bills',
  other: 'Other',
}

const getScopedExpenses = (expenses: Expense[], scope: Scope) => {
  if (scope === 'all-time') return expenses

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  return expenses.filter((expense) => {
    const date = new Date(expense.date)
    return date.getFullYear() === year && date.getMonth() === month
  })
}

const getCsvDelimiter = () => {
  const usesCommaDecimals = new Intl.NumberFormat().format(1.1).includes(',')
  return usesCommaDecimals ? ';' : ','
}

const escapeCsv = (value: string, delimiter: string) => {
  if (value.includes('"') || value.includes(delimiter) || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export const buildExpensesCsv = (expenses: Expense[], scope: Scope) => {
  const scoped = getScopedExpenses(expenses, scope)

  const delimiter = getCsvDelimiter()
  const header = ['Date', 'Description', 'Category', 'Amount'].join(delimiter)

  const rows = scoped.map((expense) => {
    const date = expense.date.slice(0, 10)
    const description = expense.description ?? ''
    const category = CATEGORY_LABEL[expense.category]
    const amount = expense.amount.toFixed(2)

    return [
      escapeCsv(date, delimiter),
      escapeCsv(description, delimiter),
      escapeCsv(category, delimiter),
      escapeCsv(amount, delimiter),
    ].join(delimiter)
  })

  const withBom = `\uFEFF${[header, ...rows].join('\r\n')}`
  return withBom
}

export const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

