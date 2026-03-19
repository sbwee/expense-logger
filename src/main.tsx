import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { DashboardPage } from './pages/dashboard'
import { SummaryPage } from './pages/summary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<DashboardPage />} />
          <Route path="summary" element={<SummaryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
