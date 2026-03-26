import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Screens
import LoginPage from '@/features/auth/LoginPage'
import HorizonScreen from '@/features/home/HorizonScreen'
import OracleScreen from '@/features/oracle/OracleScreen'
import VoyageScreen from '@/features/voyage/VoyageScreen'
import ChamberScreen from '@/features/chamber/ChamberScreen'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
    },
  },
})

function PrivateRoute({ element }: { element: React.ReactElement }) {
  const jwt = localStorage.getItem('jwt')
  return jwt ? element : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute element={<HorizonScreen />} />} />
          <Route path="/oracle" element={<PrivateRoute element={<OracleScreen />} />} />
          <Route path="/voyage" element={<PrivateRoute element={<VoyageScreen />} />} />
          <Route path="/chamber" element={<PrivateRoute element={<ChamberScreen />} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
