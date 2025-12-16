import { useEffect, useMemo, useState } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'
import {
  getExpensesDetailed,
  createExpense,
  getExpenseCategories,
  getServicesForSelect,
  type ExpenseCategory,
  type ServiceOption,
} from '../../services/treasuryApi'

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

function toInputDateTimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function Saidas() {
  const [rows, setRows] = useState<ExpenseRow[]>([])
  const [loading, setLoading] = useState(true)

  // categorias (select)
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // services (select)
  const [services, setServices] = useState<ServiceOption[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)

  // dialog/form
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState<string>('')
  const [amount, setAmount] = useState<string>('10')
  const [spentAt, setSpentAt] = useState<string>(toInputDateTimeLocal(new Date()))
  const [note, setNote] = useState<string>('')

  const [categoryId, setCategoryId] = useState<string>('')

  // agora com select (e fallback manual)
  const [serviceId, setServiceId] = useState<string>('')

  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>(
    { open: false, msg: '', severity: 'success' }
  )

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
      const data = await getExpenseCategories()
      setCategories(data ?? [])
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao carregar categorias', severity: 'error' })
    } finally {
      setLoadingCategories(false)
    }
  }

  async function loadServices() {
    setServicesLoading(true)
    try {
      const data = await getServicesForSelect()
      setServices(data ?? [])
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao carregar cultos/eventos', severity: 'error' })
    } finally {
      setServicesLoading(false)
    }
  }

  useEffect(() => {
    load()
    loadCategories()
  }, [])

  useEffect(() => {
    if (open && services.length === 0) loadServices()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedService = useMemo(() => {
    if (!serviceId) return null
    return services.find((s) => s.id === serviceId) ?? null
  }, [serviceId, services])

  const columns = useMemo<GridColDef<ExpenseRow>[]>(
    () => [
      {
        field: 'spent_at',
        headerName: 'Data',
        flex: 1,
        minWidth: 170,
        renderCell: (params) => {
          const v = params.row.spent_at
          if (!v) return '-'
          return new Date(v).toLocaleString('pt-BR')
        },
      },
      { field: 'title', headerName: 'Título', flex: 1.2, minWidth: 200, renderCell: (p) => p.row.title ?? '' },
      {
        field: 'category_name',
        headerName: 'Categoria',
        flex: 1,
        minWidth: 170,
        renderCell: (p) => p.row.category_name ?? '',
      },
      {
        field: 'amount',
        headerName: 'Valor',
        flex: 1,
        minWidth: 120,
        renderCell: (params) => {
          const n = Number(params.row.amount ?? 0)
          return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        },
      },
      {
        field: 'service_title',
        headerName: 'Culto/Evento',
        flex: 1,
        minWidth: 180,
        renderCell: (p) => p.row.service_title ?? '',
      },
      { field: 'note', headerName: 'Observação', flex: 1.2, minWidth: 220, renderCell: (p) => p.row.note ?? '' },
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
              if (!services.length) loadServices()
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
          getRowId={(r) => r.id}
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

            {/* SELECT de categoria */}
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

            {/* ✅ Select de Culto/Evento */}
            <Autocomplete
              options={services}
              loading={servicesLoading}
              value={selectedService}
              onChange={(_, v) => setServiceId(v?.id ?? '')}
              isOptionEqualToValue={(opt, v) => opt.id === v.id}
              getOptionLabel={(opt) => opt?.title ?? opt?.id ?? ''}
              renderOption={(props, opt) => (
                <li {...props} key={opt.id}>
                  <Box display="flex" flexDirection="column">
                    <Typography fontSize={14}>{opt.title ?? '(Sem título)'}</Typography>
                    <Typography fontSize={12} color="text.secondary">
                      {opt.service_date ?? ''} {opt.starts_at ? `· ${new Date(opt.starts_at).toLocaleString('pt-BR')}` : ''}
                    </Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Culto/Evento (opcional)"
                  fullWidth
                  helperText="Vincule esta saída a um culto/evento."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {servicesLoading ? <CircularProgress size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            {/* fallback manual (mantém seu fluxo antigo) */}
            <TextField
              label="Service ID (opcional, UUID) — fallback manual"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              fullWidth
              helperText="Se preferir, cole o UUID do culto/evento manualmente."
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
