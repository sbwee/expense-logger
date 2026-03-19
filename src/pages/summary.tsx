import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useExpensesStore } from '../store/expenses-store'
import type { ExpenseCategory } from '../types/expense'
import { buildExpensesCsv, downloadCsv } from '../utils/export-csv'

type Range = 'week' | 'month'

const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string }
> = {
  food: { label: 'Food', icon: '🍔', color: '#22c55e' },
  transport: { label: 'Transport', icon: '🚌', color: '#3b82f6' },
  shopping: { label: 'Shopping', icon: '🛍️', color: '#a855f7' },
  entertainment: { label: 'Entertainment', icon: '🎉', color: '#f97316' },
  health: { label: 'Health', icon: '💊', color: '#ef4444' },
  education: { label: 'Education', icon: '📚', color: '#06b6d4' },
  bills: { label: 'Bills', icon: '🏠', color: '#6366f1' },
  other: { label: 'Other', icon: '➕', color: '#9ca3af' },
}

interface CategorySlice {
  category: ExpenseCategory
  total: number
}

interface DailyTotal {
  dateLabel: string
  isoDate: string
  total: number
}

export function SummaryPage() {
  const { expenses } = useExpensesStore()
  const [range, setRange] = useState<Range>('week')

  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startOfWeek = (() => {
    const day = today.getDay()
    const diff = (day + 6) % 7
    const candidate = new Date(today)
    candidate.setDate(today.getDate() - diff)
    candidate.setHours(0, 0, 0, 0)
    return candidate
  })()

  const periodStart = range === 'week' ? startOfWeek : startOfMonth

  const periodExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const date = new Date(expense.date)
        return date >= periodStart && date <= today
      }),
    [expenses, periodStart, today],
  )

  const totalPeriodSpending = useMemo(
    () =>
      periodExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [periodExpenses],
  )

  const categoryData: CategorySlice[] = useMemo(() => {
    const map = new Map<ExpenseCategory, number>()
    for (const expense of periodExpenses) {
      map.set(expense.category, (map.get(expense.category) ?? 0) + expense.amount)
    }
    return Array.from(map.entries())
      .map(([category, total]) => ({
        category,
        total,
      }))
      .sort((a, b) => b.total - a.total)
  }, [periodExpenses])

  const dailyData: DailyTotal[] = useMemo(() => {
    const map = new Map<string, number>()
    for (const expense of periodExpenses) {
      const key = expense.date.slice(0, 10)
      map.set(key, (map.get(key) ?? 0) + expense.amount)
    }

    const days: DailyTotal[] = []
    const cursor = new Date(periodStart)
    cursor.setHours(0, 0, 0, 0)
    const end = new Date(today)
    end.setHours(0, 0, 0, 0)

    while (cursor <= end) {
      const iso = cursor.toISOString().slice(0, 10)
      const total = map.get(iso) ?? 0
      days.push({
        isoDate: iso,
        total,
        dateLabel:
          range === 'week'
            ? cursor.toLocaleDateString(undefined, {
                weekday: 'short',
              })
            : cursor.toLocaleDateString(undefined, {
                day: 'numeric',
              }),
      })
      cursor.setDate(cursor.getDate() + 1)
    }

    return days
  }, [periodExpenses, periodStart, range, today])

  const formatAmount = (value: number) =>
    new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)

  const hasData = periodExpenses.length > 0

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-4">
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Spending summary
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Review your spending by category and over time.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-700">
              <button
                type="button"
                onClick={() => setRange('week')}
                className={`flex-1 rounded-full px-3 py-1 transition ${
                  range === 'week'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                This week
              </button>
              <button
                type="button"
                onClick={() => setRange('month')}
                className={`flex-1 rounded-full px-3 py-1 transition ${
                  range === 'month'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                This month
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  const csv = buildExpensesCsv(expenses, 'this-month')
                  downloadCsv('expenses-this-month.csv', csv)
                }}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
              >
                Export this month
              </button>
              <button
                type="button"
                onClick={() => {
                  const csv = buildExpensesCsv(expenses, 'all-time')
                  downloadCsv('expenses-all-time.csv', csv)
                }}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
              >
                Export all time
              </button>
            </div>
          </div>
        </header>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Total spending
            </p>
            <p className="text-2xl font-semibold tracking-tight text-slate-900">
              {formatAmount(totalPeriodSpending)}
            </p>
          </div>
          <p className="text-xs text-slate-500">
            {range === 'week'
              ? 'Showing spending from the start of this week through today.'
              : 'Showing spending from the start of this month through today.'}
          </p>
        </div>

        {!hasData && (
          <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
            <div className="text-2xl">📊</div>
            <p className="text-sm font-medium text-slate-800">
              No expenses logged yet!
            </p>
            <p className="max-w-xs text-xs text-slate-500">
              Add some expenses on the dashboard to see your weekly and monthly
              charts here.
            </p>
          </div>
        )}

        {hasData && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <h3 className="text-xs font-semibold text-slate-800">
                Spending by category
              </h3>
              <p className="mb-2 mt-1 text-[11px] text-slate-500">
                Share of total spending in this period.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="total"
                        nameKey="category"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {categoryData.map((entry) => {
                          const meta = CATEGORY_META[entry.category]
                          return (
                            <Cell
                              key={entry.category}
                              fill={meta.color}
                              stroke="#f1f5f9"
                              strokeWidth={1}
                            />
                          )
                        })}
                      </Pie>
                      <Tooltip
                        formatter={(value, _name, props) => {
                          const slice = props.payload as CategorySlice
                          const meta = CATEGORY_META[slice.category]
                          const numericValue =
                            typeof value === 'number' ? value : Number(value ?? 0)
                          const percent =
                            totalPeriodSpending > 0
                              ? (slice.total / totalPeriodSpending) * 100
                              : 0
                          return [
                            `${formatAmount(numericValue)} (${percent.toFixed(0)}%)`,
                            meta.label,
                          ]
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <ul className="space-y-1 text-xs">
                  {categoryData.map((slice) => {
                    const meta = CATEGORY_META[slice.category]

                    return (
                      <li
                        key={slice.category}
                        className="flex items-center justify-between gap-3 rounded-lg bg-white/70 px-2 py-1"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: meta.color }}
                            aria-hidden="true"
                          />
                          <span className="truncate text-xs font-medium text-slate-800">
                            {meta.icon} {meta.label}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-900">
                          {formatAmount(slice.total)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <h3 className="text-xs font-semibold text-slate-800">
                Spending over time
              </h3>
              <p className="mb-2 mt-1 text-[11px] text-slate-500">
                Daily totals for this period.
              </p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="dateLabel"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value) => {
                        const numericValue =
                          typeof value === 'number' ? value : Number(value ?? 0)
                        return formatAmount(numericValue)
                      }}
                      labelFormatter={(_, payload) => {
                        const item = payload[0]?.payload as DailyTotal | undefined
                        if (!item) return ''
                        return new Date(item.isoDate).toLocaleDateString()
                      }}
                    />
                    <Bar
                      dataKey="total"
                      radius={[6, 6, 0, 0]}
                      className="fill-emerald-500"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

