import { Button, Container, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!error) navigate('/tesouraria')
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" sx={{ mt: 6, mb: 2 }}>
        Koinonia · Painel
      </Typography>

      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <TextField
        label="Senha"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleLogin}>
        Entrar
      </Button>
    </Container>
  )
}
