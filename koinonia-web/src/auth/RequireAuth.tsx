import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from './AuthProvider'

type Props = { children: ReactNode }

export default function RequireAuth({ children }: Props) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={22} />
          <Typography>Carregando...</Typography>
        </Box>
      </Box>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
