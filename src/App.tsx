import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const THEME_KEY = 'daily-expense-logger-theme'

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved === 'dark' || saved === 'light') return saved
    } catch {
      // ignore
    }

    return 'light'
  })

  useEffect(() => {
    const isDark = theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    document.body.classList.toggle('dark', isDark)

    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // ignore
    }
  }, [theme])

  return (
    <div
      className={`flex min-h-screen flex-col ${
        theme === 'dark'
          ? 'dark bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      <header
        className={`border-b backdrop-blur ${
          theme === 'dark'
            ? 'border-slate-800 bg-slate-900/80'
            : 'border-slate-200 bg-white/80'
        }`}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <h1
              className={`text-lg font-semibold tracking-tight ${
                theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              Daily Expense Logger
            </h1>
            <p
              className={`text-xs ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              Log your spending in seconds. No account needed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <nav
              className={`hidden gap-1 text-xs font-medium sm:flex ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                `rounded-full px-3 py-1 transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/summary"
                className={({ isActive }) =>
                  `rounded-full px-3 py-1 transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                  }`
                }
              >
                Summary
              </NavLink>
            </nav>

            <button
              type="button"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              aria-label="Toggle dark mode"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition active:scale-[0.98] ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white'
              }`}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <Outlet />

      <nav
        className={`sticky bottom-0 mt-auto border-t px-4 py-2 text-xs font-medium sm:hidden ${
          theme === 'dark'
            ? 'border-slate-800 bg-slate-900/80 text-slate-300'
            : 'border-slate-200 bg-white/95 text-slate-600'
        }`}
      >
        <div className="mx-auto flex max-w-md items-center justify-around gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-full px-3 py-1 transition ${
                isActive
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-500 dark:text-slate-300'
              }`
            }
          >
            <span className="text-base">🏠</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/summary"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-full px-3 py-1 transition ${
                isActive
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-500 dark:text-slate-300'
              }`
            }
          >
            <span className="text-base">📊</span>
            <span>Summary</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}

export default App
