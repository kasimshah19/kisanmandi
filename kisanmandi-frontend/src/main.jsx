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
              <Toaster
                position={typeof window !== 'undefined' && window.innerWidth < 768 ? 'top-center' : 'top-right'}
                toastOptions={{
                  duration: 4000,
                  className: '!rounded-xl !shadow-card !border !border-neutral-200 !text-neutral-800 !bg-white !text-sm !font-medium',
                  success: {
                    iconTheme: {
                      primary: '#15803d',
                      secondary: '#f0fdf4',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#dc2626',
                      secondary: '#fef2f2',
                    },
                  },
                }}
              />
              <App />
            </CartProvider>
          </AuthProvider>
        </ServerStatusProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)

