import { NavLink, Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              Daily Expense Logger
            </h1>
            <p className="text-xs text-slate-500">
              Log your spending in seconds. No account needed.
            </p>
          </div>
          <nav className="hidden gap-1 text-xs font-medium text-slate-600 sm:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-full px-3 py-1 transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              Summary
            </NavLink>
          </nav>
        </div>
      </header>

      <Outlet />

      <nav className="sticky bottom-0 mt-auto border-t border-slate-200 bg-white/95 px-4 py-2 text-xs font-medium text-slate-600 sm:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-full px-3 py-1 transition ${
                isActive ? 'text-slate-900' : 'text-slate-500'
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
                isActive ? 'text-slate-900' : 'text-slate-500'
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
