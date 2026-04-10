import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TripProvider } from './TripContext'
import { BudgetProvider } from './BudgetContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TripProvider>
      <BudgetProvider>
        <App />
      </BudgetProvider>
    </TripProvider>
  </StrictMode>,
)