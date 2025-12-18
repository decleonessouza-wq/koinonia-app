import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'
import { bindMemberToUser } from '../../services/treasuryApi'

export default function VincularMembro() {
  const [linkCode, setLinkCode] = useState('')
  const [loading, setLoading] = useState(false)

  const [snack, setSnack] = useState<{
    open: boolean
    msg: string
    severity: 'success' | 'error'
  }>({ open: false, msg: '', severity: 'success' })

  async function onBind() {
    if (!linkCode.trim()) {
      setSnack({ open: true, msg: 'Informe o código de vínculo.', severity: 'error' })
      return
    }

    setLoading(true)
    try {
      const res = await bindMemberToUser(linkCode.trim())

      setSnack({
        open: true,
        msg: `Vínculo realizado com sucesso! Bem-vindo(a), ${res.full_name}.`,
        severity: 'success',
      })

      setLinkCode('')
    } catch (e: any) {
      setSnack({
        open: true,
        msg: e?.message ?? 'Erro ao vincular membro.',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxWidth={420}>
      <Typography variant="h4" mb={1}>
        Vincular membro
      </Typography>

      <Typography variant="body2" sx={{ opacity: 0.8 }} mb={3}>
        Informe o código fornecido pela igreja para vincular seu usuário ao seu cadastro de membro.
      </Typography>

      <TextField
        label="Código de vínculo"
        value={linkCode}
        onChange={(e) => setLinkCode(e.target.value)}
        fullWidth
        helperText="Exemplo: ABC123XYZ"
      />

      <Box mt={3}>
        <Button
          variant="contained"
          onClick={onBind}
          disabled={loading}
          fullWidth
        >
          {loading ? 'Vinculando...' : 'Vincular'}
        </Button>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
