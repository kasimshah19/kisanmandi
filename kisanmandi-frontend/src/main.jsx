import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ServerStatusProvider } from './context/ServerStatusContext'
import ErrorBoundary from './components/ErrorBoundary'
import './i18n'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ServerStatusProvider>
          <AuthProvider>
            <CartProvider>
              <Toaster position="top-right" />
              <App />
            </CartProvider>
          </AuthProvider>
        </ServerStatusProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)

