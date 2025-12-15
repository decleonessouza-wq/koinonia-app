import { useEffect, useMemo, useState } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'
import { supabase } from '../../lib/supabaseClient'
import { getExpensesDetailed, createExpense } from '../../services/treasuryApi'

type ExpenseRow = {
  id: string
  spent_at: string | null
  title: string | null
  amount: number | null
  category_name: string | null
  service_title: string | null
  note: string | null
  category_id?: string | null
  service_id?: string | null
}

type CategoryOption = {
  id: string
  name: string
}

function toInputDateTimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`
}

export default function Saidas() {
  const [rows, setRows] = useState<ExpenseRow[]>([])
  const [loading, setLoading] = useState(true)

  // categorias (select)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // dialog/form
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState<string>('')
  const [amount, setAmount] = useState<string>('10')
  const [spentAt, setSpentAt] = useState<string>(toInputDateTimeLocal(new Date()))
  const [note, setNote] = useState<string>('')

  // agora é SELECT (id)
  const [categoryId, setCategoryId] = useState<string>('')

  // segue manual por enquanto (próximo passo: select de services)
  const [serviceId, setServiceId] = useState<string>('')

  // feedback
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false,
    msg: '',
    severity: 'success',
  })

  async function load() {
    setLoading(true)
    try {
      const data = await getExpensesDetailed()
      setRows((data ?? []) as ExpenseRow[])
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao carregar saídas', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    setLoadingCategories(true)
    try {
      // ✅ Aqui está a correção: buscar colunas CORRETAS da tabela expense_categories
      const { data, error } = await supabase
        .from('expense_categories')
        .select('id,name')
        .order('name', { ascending: true })

      if (error) throw error

      const normalized: CategoryOption[] = (data ?? [])
        .filter((c: any) => c?.id && c?.name)
        .map((c: any) => ({ id: String(c.id), name: String(c.name) }))

      setCategories(normalized)
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao carregar categorias', severity: 'error' })
      setCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => {
    load()
    loadCategories()
  }, [])

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'spent_at',
        headerName: 'Data',
        flex: 1,
        minWidth: 170,
        renderCell: (params: any) => {
          const v = params?.row?.spent_at as string | null | undefined
          if (!v) return '-'
          return new Date(v).toLocaleString('pt-BR')
        },
      },
      {
        field: 'title',
        headerName: 'Título',
        flex: 1.2,
        minWidth: 200,
        renderCell: (p: any) => p?.row?.title ?? '',
      },
      {
        field: 'category_name',
        headerName: 'Categoria',
        flex: 1,
        minWidth: 170,
        renderCell: (p: any) => p?.row?.category_name ?? '',
      },
      {
        field: 'amount',
        headerName: 'Valor',
        flex: 1,
        minWidth: 120,
        renderCell: (params: any) => {
          const n = Number(params?.row?.amount ?? 0)
          return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
      },
      {
        field: 'service_title',
        headerName: 'Culto/Evento',
        flex: 1,
        minWidth: 180,
        renderCell: (p: any) => p?.row?.service_title ?? '',
      },
      {
        field: 'note',
        headerName: 'Observação',
        flex: 1.2,
        minWidth: 220,
        renderCell: (p: any) => p?.row?.note ?? '',
      },
    ],
    []
  )

  function resetForm() {
    setTitle('')
    setAmount('10')
    setSpentAt(toInputDateTimeLocal(new Date()))
    setNote('')
    setCategoryId('')
    setServiceId('')
  }

  async function onSave() {
    const parsedAmount = Number(amount)

    if (!title.trim()) {
      setSnack({ open: true, msg: 'Informe um título.', severity: 'error' })
      return
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setSnack({ open: true, msg: 'Informe um valor válido (maior que 0).', severity: 'error' })
      return
    }
    if (!spentAt) {
      setSnack({ open: true, msg: 'Informe a data/hora da saída.', severity: 'error' })
      return
    }
    if (!categoryId) {
      setSnack({ open: true, msg: 'Selecione uma categoria.', severity: 'error' })
      return
    }

    setSaving(true)
    try {
      const iso = new Date(spentAt).toISOString()

      await createExpense({
        title: title.trim(),
        amount: parsedAmount,
        spent_at: iso,
        note: note.trim() ? note.trim() : null,
        category_id: categoryId,
        service_id: serviceId.trim() ? serviceId.trim() : null,
      })

      setSnack({ open: true, msg: 'Saída cadastrada com sucesso!', severity: 'success' })
      setOpen(false)
      resetForm()
      await load()
    } catch (e: any) {
      setSnack({
        open: true,
        msg: e?.message ?? 'Erro ao cadastrar saída (verifique RLS/permissões).',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Saídas</Typography>

        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={load} disabled={loading}>
            Atualizar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpen(true)
              if (!categories.length) loadCategories()
            }}
            disabled={loading}
          >
            Nova saída
          </Button>
        </Box>
      </Box>

      <Box sx={{ height: 520, width: '100%', background: '#fff', borderRadius: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(r: any) => r.id}
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
            sorting: { sortModel: [{ field: 'spent_at', sort: 'desc' }] },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </Box>

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nova saída</DialogTitle>
        <DialogContent>
          <Box display="grid" gap={2} mt={1}>
            <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />

            <TextField
              label="Valor"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              fullWidth
            />

            <TextField
              label="Data/Hora da saída"
              value={spentAt}
              onChange={(e) => setSpentAt(e.target.value)}
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Observação (opcional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />

            {/* ✅ SELECT de categoria */}
            <TextField
              select
              label="Categoria"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              fullWidth
              disabled={loadingCategories}
              helperText={
                loadingCategories
                  ? 'Carregando categorias...'
                  : categories.length
                    ? 'Selecione a categoria da saída.'
                    : 'Nenhuma categoria encontrada para esta igreja.'
              }
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Service ID (opcional, UUID)"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              fullWidth
              helperText="Depois vamos trocar por um seletor de cultos/eventos."
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={onSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
