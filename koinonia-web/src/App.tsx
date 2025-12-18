import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AppLayout from './layout/AppLayout'
import RequireAuth from './auth/RequireAuth'

import Dashboard from './pages/tesouraria/Dashboard'
import Entradas from './pages/tesouraria/Entradas'
import Saidas from './pages/tesouraria/Saidas'
import Services from './pages/tesouraria/Services'

// ✅ Módulo Membros (global)
import Membros from './pages/membros/Membros'
import VincularMembro from './pages/membros/VincularMembro'

// ✅ Relatórios Avançados (início)
import RelatoriosAvancados from './pages/relatorios/RelatoriosAvancados'

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

        {/* Tesouraria */}
        <Route path="tesouraria" element={<Dashboard />} />
        <Route path="tesouraria/entradas" element={<Entradas />} />
        <Route path="tesouraria/saidas" element={<Saidas />} />
        <Route path="tesouraria/services" element={<Services />} />

        {/* Membros (global) */}
        <Route path="membros" element={<Membros />} />
        <Route path="membros/vincular" element={<VincularMembro />} />

        {/* Relatórios Avançados (início) */}
        <Route path="relatorios-avancados" element={<RelatoriosAvancados />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
