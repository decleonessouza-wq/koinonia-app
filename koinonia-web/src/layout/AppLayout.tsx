import { AppBar, Box, Button, Divider, Drawer, Toolbar, Typography } from '@mui/material'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

const drawerWidth = 240

export default function AppLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: 1300 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Koinonia
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, top: 64 },
        }}
      >
        <Box sx={{ p: 2, display: 'grid', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
            Tesouraria
          </Typography>

          <Button fullWidth component={Link} to="/tesouraria">
            Dashboard
          </Button>
          <Button fullWidth component={Link} to="/tesouraria/entradas">
            Entradas
          </Button>
          <Button fullWidth component={Link} to="/tesouraria/saidas">
            Saídas
          </Button>
          <Button fullWidth component={Link} to="/tesouraria/services">
            Cultos/Eventos
          </Button>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
            Módulos
          </Typography>

          <Button fullWidth component={Link} to="/membros">
            Membros
          </Button>
          <Button fullWidth component={Link} to="/membros/vincular">
            Vincular Membro
          </Button>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
            Relatórios
          </Typography>

          <Button fullWidth component={Link} to="/relatorios-avancados">
            Relatórios avançados
          </Button>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: `${drawerWidth}px` }}>
        <Outlet />
      </Box>
    </Box>
  )
}
