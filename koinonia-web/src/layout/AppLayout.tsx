import { AppBar, Box, Button, Drawer, Toolbar, Typography } from '@mui/material'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

const drawerWidth = 220

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
            Koinonia · Tesouraria
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
        <Box sx={{ p: 2 }}>
          <Button fullWidth component={Link} to="/tesouraria">
            Dashboard
          </Button>
          <Button fullWidth component={Link} to="/tesouraria/entradas">
            Entradas
          </Button>
          <Button fullWidth component={Link} to="/tesouraria/saidas">
            Saídas
          </Button>

          {/* ✅ Services */}
          <Button fullWidth component={Link} to="/tesouraria/services">
            Cultos/Eventos
          </Button>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: `${drawerWidth}px` }}>
        <Outlet />
      </Box>
    </Box>
  )
}
