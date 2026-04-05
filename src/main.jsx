import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

import { PrivateRoute } from './components/layout/PrivateRoute.jsx'
import LoginPage from './pages/LoginPage.jsx'
import WorkspacesPage from './pages/WorkspacesPage.jsx'
import WorkspacePage from './pages/WorkspacePage.jsx'
import BoardPage from './pages/BoardPage.jsx'
import PublicBoardPage from './pages/public/PublicBoardPage.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
    },
  },
})

async function bootstrap() {
  const { worker } = await import('./mocks/browser.js')
  await worker.start({ 
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  })

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/public/board/:token" element={<PublicBoardPage />} />

            {/* Private routes */}
            <Route path="/workspaces" element={<PrivateRoute><WorkspacesPage /></PrivateRoute>} />
            <Route path="/workspace/:workspaceId" element={<PrivateRoute><WorkspacePage /></PrivateRoute>} />
            <Route path="/workspace/:workspaceId/board/:boardId" element={<PrivateRoute><BoardPage /></PrivateRoute>} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/workspaces" replace />} />
            <Route path="*" element={<Navigate to="/workspaces" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  )
}

bootstrap()
