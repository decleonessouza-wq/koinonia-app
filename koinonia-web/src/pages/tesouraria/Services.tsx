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
  Snackbar,
  TextField,
  Typography,
  Tabs,
  Tab,
  Divider,
} from '@mui/material'
import {
  createService,
  getServicesDetailed,
  getContributionsDetailedByService,
  getExpensesDetailedByService,
  type ServiceDetailed,
} from '../../services/treasuryApi'

function formatBRL(value: number) {
  return Number(value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateBR(value: any) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('pt-BR')
}

function formatDateTimeBR(value: any) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('pt-BR')
}

function toInputDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function Services() {
  const [rows, setRows] = useState<ServiceDetailed[]>([])
  const [loading, setLoading] = useState(true)

  // dialog cadastro
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [serviceDate, setServiceDate] = useState(toInputDate(new Date()))
  const [startsAt, setStartsAt] = useState<string>('') // datetime-local
  const [endsAt, setEndsAt] = useState<string>('') // datetime-local
  const [notes, setNotes] = useState('')

  // relatório
  const [reportOpen, setReportOpen] = useState(false)
  const [reportTab, setReportTab] = useState(0)
  const [reportService, setReportService] = useState<ServiceDetailed | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportIncomes, setReportIncomes] = useState<any[]>([])
  const [reportExpenses, setReportExpenses] = useState<any[]>([])

  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false,
    msg: '',
    severity: 'success',
  })

  async function load() {
    setLoading(true)
    try {
      const data = await getServicesDetailed()
      setRows(data ?? [])
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao carregar cultos/eventos', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setTitle('')
    setServiceDate(toInputDate(new Date()))
    setStartsAt('')
    setEndsAt('')
    setNotes('')
  }

  async function onSave() {
    if (!title.trim()) {
      setSnack({ open: true, msg: 'Informe um título.', severity: 'error' })
      return
    }
    if (!serviceDate) {
      setSnack({ open: true, msg: 'Informe a data do culto/evento.', severity: 'error' })
      return
    }

    setSaving(true)
    try {
      const startsIso = startsAt ? new Date(startsAt).toISOString() : null
      const endsIso = endsAt ? new Date(endsAt).toISOString() : null

      await createService({
        title: title.trim(),
        service_date: serviceDate,
        notes: notes.trim() ? notes.trim() : null,
        starts_at: startsIso,
        ends_at: endsIso,
      })

      setSnack({ open: true, msg: 'Culto/Evento cadastrado com sucesso!', severity: 'success' })
      setOpen(false)
      resetForm()
      await load()
    } catch (e: any) {
      setSnack({
        open: true,
        msg: e?.message ?? 'Erro ao cadastrar culto/evento (RLS/permissões).',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  async function fetchReport(serviceId: string) {
    setReportLoading(true)
    setReportIncomes([])
    setReportExpenses([])
    try {
      const [inc, exp] = await Promise.all([
        getContributionsDetailedByService(serviceId),
        getExpensesDetailedByService(serviceId),
      ])
      setReportIncomes((inc ?? []) as any[])
      setReportExpenses((exp ?? []) as any[])
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao carregar relatório do culto/evento.', severity: 'error' })
    } finally {
      setReportLoading(false)
    }
  }

  async function openReport(svc: ServiceDetailed) {
    setReportService(svc)
    setReportTab(0)
    setReportOpen(true)
    await fetchReport(svc.id)
  }

  useEffect(() => {
    load()
  }, [])

  const columns = useMemo<GridColDef<ServiceDetailed>[]>(
    () => [
      {
        field: 'service_date',
        headerName: 'Data',
        flex: 1,
        minWidth: 140,
        renderCell: (p) => (p.row.service_date ? formatDateBR(p.row.service_date) : '-'),
      },
      {
        field: 'title',
        headerName: 'Título',
        flex: 1.5,
        minWidth: 240,
        renderCell: (p) => p.row.title ?? '',
      },
      {
        field: 'total_income',
        headerName: 'Entradas',
        flex: 1,
        minWidth: 140,
        renderCell: (p) => formatBRL(Number(p.row.total_income ?? 0)),
      },
      {
        field: 'total_expense',
        headerName: 'Saídas',
        flex: 1,
        minWidth: 140,
        renderCell: (p) => formatBRL(Number(p.row.total_expense ?? 0)),
      },
      {
        field: 'balance',
        headerName: 'Saldo',
        flex: 1,
        minWidth: 140,
        renderCell: (p) => formatBRL(Number(p.row.balance ?? 0)),
      },
      {
        field: 'actions',
        headerName: 'Ações',
        sortable: false,
        filterable: false,
        minWidth: 170,
        renderCell: (p) => (
          <Button size="small" variant="outlined" onClick={() => openReport(p.row)}>
            Ver relatório
          </Button>
        ),
      },
    ],
    []
  )

  const incomeCols = useMemo<GridColDef<any>[]>(
    () => [
      {
        field: 'received_at',
        headerName: 'Data',
        flex: 1,
        minWidth: 170,
        renderCell: (p) => (p.row.received_at ? formatDateTimeBR(p.row.received_at) : '-'),
      },
      { field: 'kind', headerName: 'Tipo', flex: 1, minWidth: 110, renderCell: (p) => p.row.kind ?? '' },
      {
        field: 'amount',
        headerName: 'Valor',
        flex: 1,
        minWidth: 120,
        renderCell: (p) => formatBRL(Number(p.row.amount ?? 0)),
      },
      { field: 'member_name', headerName: 'Membro', flex: 1.2, minWidth: 160, renderCell: (p) => p.row.member_name ?? '' },
      { field: 'note', headerName: 'Obs', flex: 1.5, minWidth: 220, renderCell: (p) => p.row.note ?? '' },
    ],
    []
  )

  const expenseCols = useMemo<GridColDef<any>[]>(
    () => [
      {
        field: 'spent_at',
        headerName: 'Data',
        flex: 1,
        minWidth: 170,
        renderCell: (p) => (p.row.spent_at ? formatDateTimeBR(p.row.spent_at) : '-'),
      },
      { field: 'title', headerName: 'Título', flex: 1.2, minWidth: 200, renderCell: (p) => p.row.title ?? '' },
      { field: 'category_name', headerName: 'Categoria', flex: 1, minWidth: 170, renderCell: (p) => p.row.category_name ?? '' },
      {
        field: 'amount',
        headerName: 'Valor',
        flex: 1,
        minWidth: 120,
        renderCell: (p) => formatBRL(Number(p.row.amount ?? 0)),
      },
      { field: 'note', headerName: 'Obs', flex: 1.5, minWidth: 220, renderCell: (p) => p.row.note ?? '' },
    ],
    []
  )

  const reportTotals = useMemo(() => {
    const totalIncome = (reportIncomes ?? []).reduce((acc, r) => acc + Number(r?.amount ?? 0), 0)
    const totalExpense = (reportExpenses ?? []).reduce((acc, r) => acc + Number(r?.amount ?? 0), 0)
    const balance = totalIncome - totalExpense
    return { totalIncome, totalExpense, balance }
  }, [reportIncomes, reportExpenses])

  const shownTotals = useMemo(() => {
    const hasLoaded = (reportIncomes?.length ?? 0) > 0 || (reportExpenses?.length ?? 0) > 0
    if (hasLoaded) return reportTotals
    return {
      totalIncome: Number(reportService?.total_income ?? 0),
      totalExpense: Number(reportService?.total_expense ?? 0),
      balance: Number(reportService?.balance ?? 0),
    }
  }, [reportTotals, reportIncomes, reportExpenses, reportService])

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Cultos/Eventos</Typography>

        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={load} disabled={loading}>
            Atualizar
          </Button>
          <Button variant="contained" onClick={() => setOpen(true)} disabled={loading}>
            Novo culto/evento
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
            sorting: { sortModel: [{ field: 'service_date', sort: 'desc' }] },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </Box>

      {/* Cadastro */}
      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo culto/evento</DialogTitle>
        <DialogContent>
          <Box display="grid" gap={2} mt={1}>
            <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />

            <TextField
              label="Data do culto/evento"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Início (opcional)"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Fim (opcional)"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Notas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              minRows={2}
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

      {/* Relatório */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>
          Relatório · {reportService?.title ?? ''}{' '}
          {reportService?.service_date ? `(${formatDateBR(reportService.service_date)})` : ''}
        </DialogTitle>

        <DialogContent>
          {reportService && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                ID: {reportService.id}
                {reportService.starts_at ? ` · Início: ${formatDateTimeBR(reportService.starts_at)}` : ''}
                {reportService.ends_at ? ` · Fim: ${formatDateTimeBR(reportService.ends_at)}` : ''}
              </Typography>

              {reportService.notes ? (
                <Typography sx={{ mt: 1 }}>
                  <b>Notas:</b> {reportService.notes}
                </Typography>
              ) : null}

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: 'grid',
                  gap: 1,
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                }}
              >
                <Box>
                  <Typography sx={{ opacity: 0.8 }}>Entradas</Typography>
                  <Typography variant="h6">{formatBRL(shownTotals.totalIncome)}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {reportIncomes.length} registro(s)
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ opacity: 0.8 }}>Saídas</Typography>
                  <Typography variant="h6">{formatBRL(shownTotals.totalExpense)}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {reportExpenses.length} registro(s)
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ opacity: 0.8 }}>Saldo</Typography>
                  <Typography variant="h6">{formatBRL(shownTotals.balance)}</Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => reportService?.id && fetchReport(reportService.id)}
                  disabled={reportLoading}
                >
                  {reportLoading ? 'Atualizando...' : 'Atualizar relatório'}
                </Button>
              </Box>
            </Box>
          )}

          <Tabs value={reportTab} onChange={(_, v) => setReportTab(v)}>
            <Tab label="Entradas" />
            <Tab label="Saídas" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {reportLoading ? (
              <Typography>Carregando relatório...</Typography>
            ) : reportTab === 0 ? (
              reportIncomes.length ? (
                <Box sx={{ height: 420, width: '100%', background: '#fff', borderRadius: 1 }}>
                  <DataGrid
                    rows={reportIncomes}
                    columns={incomeCols}
                    getRowId={(r: any) => r.id}
                    disableRowSelectionOnClick
                    initialState={{
                      pagination: { paginationModel: { pageSize: 25, page: 0 } },
                      sorting: { sortModel: [{ field: 'received_at', sort: 'desc' }] },
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                  />
                </Box>
              ) : (
                <Typography sx={{ opacity: 0.8 }}>Nenhuma entrada vinculada a este culto/evento.</Typography>
              )
            ) : reportExpenses.length ? (
              <Box sx={{ height: 420, width: '100%', background: '#fff', borderRadius: 1 }}>
                <DataGrid
                  rows={reportExpenses}
                  columns={expenseCols}
                  getRowId={(r: any) => r.id}
                  disableRowSelectionOnClick
                  initialState={{
                    pagination: { paginationModel: { pageSize: 25, page: 0 } },
                    sorting: { sortModel: [{ field: 'spent_at', sort: 'desc' }] },
                  }}
                  pageSizeOptions={[10, 25, 50, 100]}
                />
              </Box>
            ) : (
              <Typography sx={{ opacity: 0.8 }}>Nenhuma saída vinculada a este culto/evento.</Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>Fechar</Button>
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
