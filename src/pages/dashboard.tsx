import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useExpensesStore } from '../store/expenses-store'
import type { ExpenseCategory } from '../types/expense'

const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string; icon: string }[] =
  [
    { value: 'food', label: 'Food', icon: '🍔' },
    { value: 'transport', label: 'Transport', icon: '🚌' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎉' },
    { value: 'health', label: 'Health', icon: '💊' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'bills', label: 'Bills', icon: '🏠' },
    { value: 'other', label: 'Other', icon: '➕' },
  ]

export function DashboardPage() {
  const { expenses, monthlyBudget, addExpense, removeExpense, setMonthlyBudget } =
    useExpensesStore()

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ExpenseCategory | ''>('')
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [error, setError] = useState<string | null>(null)
  const [budgetInput, setBudgetInput] = useState(
    monthlyBudget ? String(monthlyBudget) : '',
  )
  const [budgetError, setBudgetError] = useState<string | null>(null)

  const sortedExpenses = useMemo(
    () =>
      [...expenses].sort((a, b) => {
        if (a.date === b.date) {
          return b.id.localeCompare(a.id)
        }
        return b.date.localeCompare(a.date)
      }),
    [expenses],
  )

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const currentMonthSpent = useMemo(
    () =>
      expenses.reduce((total, expense) => {
        const expenseDate = new Date(expense.date)
        if (
          expenseDate.getFullYear() === currentYear &&
          expenseDate.getMonth() === currentMonth
        ) {
          return total + expense.amount
        }
        return total
      }, 0),
    [expenses, currentMonth, currentYear],
  )

  const budgetUsage = monthlyBudget ? currentMonthSpent / monthlyBudget : 0

  let budgetState: 'none' | 'green' | 'yellow' | 'red' = 'none'
  if (monthlyBudget && monthlyBudget > 0) {
    if (budgetUsage >= 1) {
      budgetState = 'red'
    } else if (budgetUsage >= 0.75) {
      budgetState = 'yellow'
    } else {
      budgetState = 'green'
    }
  }

  const handleBudgetSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBudgetError(null)

    const numeric = Number(budgetInput.replace(',', '.'))
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setBudgetError('Please enter a valid monthly budget.')
      return
    }

    setMonthlyBudget(Number(numeric.toFixed(2)))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const numericAmount = Number(amount.replace(',', '.'))
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount.')
      return
    }

    if (!category) {
      setError('Please choose a category.')
      return
    }

    if (!date) {
      setError('Please select a date.')
      return
    }

    addExpense({
      amount: Number(numericAmount.toFixed(2)),
      description: description.trim() || undefined,
      category,
      date,
    })

    setAmount('')
    setDescription('')
  }

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const formatAmount = (value: number) =>
    new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)

  const getCategoryMeta = (value: ExpenseCategory) =>
    CATEGORY_OPTIONS.find((option) => option.value === value) ??
    CATEGORY_OPTIONS[CATEGORY_OPTIONS.length - 1]

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-4">
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Monthly budget
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Set a single monthly budget. We&apos;ll warn you as you approach
              or exceed it.
            </p>

            <form
              onSubmit={handleBudgetSubmit}
              className="mt-3 flex gap-2 text-sm"
            >
              <div className="flex-1">
                <label
                  htmlFor="budget"
                  className="sr-only text-xs font-medium text-slate-700"
                >
                  Monthly budget
                </label>
                <input
                  id="budget"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={budgetInput}
                  onChange={(event) => setBudgetInput(event.target.value)}
                  placeholder="e.g. 5000"
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-600 focus:ring-2"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-full bg-slate-900 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
              >
                Save
              </button>
            </form>
            {budgetError && (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {budgetError}
              </p>
            )}
          </div>

          <div className="mt-2 w-full max-w-xs rounded-xl bg-slate-50 p-3 text-xs text-slate-700 sm:mt-0">
            {monthlyBudget && monthlyBudget > 0 ? (
              <>
                <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  <span>Current month</span>
                  <span>
                    {formatAmount(currentMonthSpent)} /{' '}
                    {formatAmount(monthlyBudget)}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      budgetState === 'red'
                        ? 'bg-red-500'
                        : budgetState === 'yellow'
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.max(
                        4,
                        Math.min(100, budgetUsage * 100),
                      ).toFixed(0)}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-600">
                  {budgetState === 'red' && (
                    <>You&apos;ve exceeded your monthly budget!</>
                  )}
                  {budgetState === 'yellow' && (
                    <>You&apos;re approaching your budget limit!</>
                  )}
                  {budgetState === 'green' && (
                    <>You&apos;re within your budget for this month.</>
                  )}
                  {budgetState === 'none' && (
                    <>
                      Add some expenses for this month to see your budget
                      progress.
                    </>
                  )}
                </p>
              </>
            ) : (
              <p className="text-[11px] text-slate-600">
                No monthly budget set yet. Enter an amount and save to start
                tracking your spending against it.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Add expense</h2>
        <p className="mt-1 text-xs text-slate-500">
          Amount and category are required. Description is optional.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-3 text-sm"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="amount"
                className="text-xs font-medium text-slate-700"
              >
                Amount
              </label>
              <input
                id="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-600 focus:ring-2"
                placeholder="0.00"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="category"
                className="text-xs font-medium text-slate-700"
              >
                Category
              </label>
              <select
                id="category"
                required
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as ExpenseCategory)
                }
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-600 focus:ring-2"
              >
                <option value="">Select a category</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="description"
                className="text-xs font-medium text-slate-700"
              >
                Description{' '}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-600 focus:ring-2"
                placeholder="e.g. Lunch, metro ticket"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="date"
                className="text-xs font-medium text-slate-700"
              >
                Date
              </label>
              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-emerald-500/20 transition focus:border-emerald-600 focus:ring-2"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-600">{error}</p>
          )}

          <div className="mt-1 flex justify-end">
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-full bg-emerald-700 px-4 text-xs font-semibold text-emerald-50 shadow-sm transition hover:bg-emerald-800 active:scale-[0.99]"
            >
              Add expense
            </button>
          </div>
        </form>
      </section>

      <section className="mb-4 flex-1 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <header className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Recent expenses
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Your expenses are stored on this device only.
            </p>
          </div>
          {sortedExpenses.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {sortedExpenses.length} item
              {sortedExpenses.length > 1 ? 's' : ''}
            </span>
          )}
        </header>

        {sortedExpenses.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
            <div className="text-2xl">✏️</div>
            <p className="text-sm font-medium text-slate-800">
              No expenses logged yet
            </p>
            <p className="max-w-xs text-xs text-slate-500">
              Start by adding your first expense above. It only takes a few
              seconds.
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100 text-sm">
            {sortedExpenses.map((expense) => {
              const meta = getCategoryMeta(expense.category)

              return (
                <li
                  key={expense.id}
                  className="flex items-start gap-3 py-2.5"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base">
                    {meta.icon}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-900">
                          {meta.label}
                        </span>
                        <span className="text-[11px] uppercase tracking-wide text-slate-400">
                          {formatDate(expense.date)}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatAmount(expense.amount)}
                      </span>
                    </div>
                    {expense.description && (
                      <p className="truncate text-xs text-slate-500">
                        {expense.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExpense(expense.id)}
                    className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                    aria-label="Delete expense"
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}

