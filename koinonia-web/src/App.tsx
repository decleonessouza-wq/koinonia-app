import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AppLayout from './layout/AppLayout'
import RequireAuth from './auth/RequireAuth'

import Dashboard from './pages/tesouraria/Dashboard'
import Entradas from './pages/tesouraria/Entradas'
import Saidas from './pages/tesouraria/Saidas'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/tesouraria" replace />} />
        <Route path="tesouraria" element={<Dashboard />} />
        <Route path="tesouraria/entradas" element={<Entradas />} />
        <Route path="tesouraria/saidas" element={<Saidas />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
