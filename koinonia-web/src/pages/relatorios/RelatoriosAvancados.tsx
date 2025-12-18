import { useEffect, useMemo, useState } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import {
  getContributionsDetailedByPeriod,
  getExpensesDetailedByPeriod,
  getMembersForSelect,
  getServicesDetailed,
  getContributionsDetailedByMember,
  type MemberOption,
  type ServiceDetailed,
} from '../../services/treasuryApi'

function formatBRL(v: number) {
  return Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function toInputDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function startOfDayISO(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toISOString()
}

function endOfDayISO(dateStr: string) {
  return new Date(`${dateStr}T23:59:59`).toISOString()
}

function isValidISODateInput(dateStr: string) {
  if (!dateStr) return false
  const d = new Date(`${dateStr}T00:00:00`)
  return !Number.isNaN(d.getTime())
}

type ContributionDetailedRow = {
  id: string
  received_at: string | null
  kind: string | null
  amount: number | null
  member_id?: string | null
  member_name?: string | null
  service_id?: string | null
  service_title?: string | null
  note?: string | null
}

type ExpenseDetailedRow = {
  id: string
  spent_at: string | null
  title: string | null
  amount: number | null
  category_id?: string | null
  category_name?: string | null
  service_id?: string | null
  service_title?: string | null
  note?: string | null
}

export default function RelatoriosAvancados() {
  const [tab, setTab] = useState(0)

  // período
  const [fromDate, setFromDate] = useState(toInputDate(new Date()))
  const [toDate, setToDate] = useState(toInputDate(new Date()))
  const [loadingPeriod, setLoadingPeriod] = useState(false)
  const [periodIncomes, setPeriodIncomes] = useState<ContributionDetailedRow[]>([])
  const [periodExpenses, setPeriodExpenses] = useState<ExpenseDetailedRow[]>([])

  // por culto/evento
  const [services, setServices] = useState<ServiceDetailed[]>([])
  const [loadingServices, setLoadingServices] = useState(false)

  // por membro
  const [members, setMembers] = useState<MemberOption[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [memberId, setMemberId] = useState<string>('')
  const [memberRowsLoading, setMemberRowsLoading] = useState(false)
  const [memberRows, setMemberRows] = useState<ContributionDetailedRow[]>([])

  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false,
    msg: '',
    severity: 'success',
  })

  const selectedMember = useMemo(() => {
    if (!memberId) return null
    return members.find((m) => m.id === memberId) ?? null
  }, [memberId, members])

  const periodHasResults = useMemo(
    () => (periodIncomes?.length ?? 0) > 0 || (periodExpenses?.length ?? 0) > 0,
    [periodIncomes, periodExpenses]
  )

  const dateError = useMemo(() => {
    if (!fromDate || !toDate) return ''
    if (!isValidISODateInput(fromDate) || !isValidISODateInput(toDate)) return 'Data inválida.'
    const a = new Date(`${fromDate}T00:00:00`).getTime()
    const b = new Date(`${toDate}T00:00:00`).getTime()
    if (a > b) return 'A data inicial não pode ser maior que a data final.'
    return ''
  }, [fromDate, toDate])

  async function runPeriod() {
    if (!fromDate || !toDate) {
      setSnack({ open: true, msg: 'Informe as duas datas (início e fim).', severity: 'error' })
      return
    }
    if (dateError) {
      setSnack({ open: true, msg: dateError, severity: 'error' })
      return
    }

    setLoadingPeriod(true)
    setPeriodIncomes([])
    setPeriodExpenses([])
    try {
      const startIso = startOfDayISO(fromDate)
      const endIso = endOfDayISO(toDate)

      const [inc, exp] = await Promise.all([
        getContributionsDetailedByPeriod(startIso, endIso),
        getExpensesDetailedByPeriod(startIso, endIso),
      ])

      setPeriodIncomes((inc ?? []) as any)
      setPeriodExpenses((exp ?? []) as any)

      const incCount = (inc ?? []).length
      const expCount = (exp ?? []).length
      setSnack({
        open: true,
        msg: `Resumo gerado: ${incCount} entrada(s) e ${expCount} saída(s).`,
        severity: 'success',
      })
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao carregar resumo por período.', severity: 'error' })
    } finally {
      setLoadingPeriod(false)
    }
  }

  async function loadServicesTotals() {
    setLoadingServices(true)
    try {
      const data = await getServicesDetailed()
      setServices(data ?? [])
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao carregar resumo por culto/evento.', severity: 'error' })
    } finally {
      setLoadingServices(false)
    }
  }

  async function loadMembers() {
    setMembersLoading(true)
    try {
      const data = await getMembersForSelect()
      setMembers(data ?? [])
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao carregar membros.', severity: 'error' })
    } finally {
      setMembersLoading(false)
    }
  }

  async function loadMemberHistory(id: string) {
    if (!id) return
    setMemberRowsLoading(true)
    setMemberRows([])
    try {
      const data = await getContributionsDetailedByMember(id)
      setMemberRows((data ?? []) as any)

      const count = (data ?? []).length
      setSnack({
        open: true,
        msg: count ? `Histórico carregado: ${count} entrada(s).` : 'Nenhuma entrada encontrada para este membro.',
        severity: 'success',
      })
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao carregar histórico do membro.', severity: 'error' })
    } finally {
      setMemberRowsLoading(false)
    }
  }

  // carregar dados base conforme a aba
  useEffect(() => {
    if (tab === 1 && services.length === 0) loadServicesTotals()
    if (tab === 2 && members.length === 0) loadMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const periodTotals = useMemo(() => {
    const totalIncome = (periodIncomes ?? []).reduce((acc, r) => acc + Number(r?.amount ?? 0), 0)
    const totalExpense = (periodExpenses ?? []).reduce((acc, r) => acc + Number(r?.amount ?? 0), 0)
    const balance = totalIncome - totalExpense
    return { totalIncome, totalExpense, balance }
  }, [periodIncomes, periodExpenses])

  const topCategories = useMemo(() => {
    const map = new Map<string, { category_name: string; total: number; count: number }>()
    for (const r of periodExpenses ?? []) {
      const key = String(r?.category_name ?? 'Sem categoria')
      const prev = map.get(key) ?? { category_name: key, total: 0, count: 0 }
      prev.total += Number(r?.amount ?? 0)
      prev.count += 1
      map.set(key, prev)
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [periodExpenses])

  const topServicesInPeriod = useMemo(() => {
    const map = new Map<string, { service_title: string; total_income: number; total_expense: number; balance: number }>()
    for (const r of periodIncomes ?? []) {
      const key = String(r?.service_title ?? 'Sem culto/evento')
      const prev = map.get(key) ?? { service_title: key, total_income: 0, total_expense: 0, balance: 0 }
      prev.total_income += Number(r?.amount ?? 0)
      map.set(key, prev)
    }
    for (const r of periodExpenses ?? []) {
      const key = String(r?.service_title ?? 'Sem culto/evento')
      const prev = map.get(key) ?? { service_title: key, total_income: 0, total_expense: 0, balance: 0 }
      prev.total_expense += Number(r?.amount ?? 0)
      map.set(key, prev)
    }
    const arr = Array.from(map.values()).map((x) => ({ ...x, balance: x.total_income - x.total_expense }))
    return arr.sort((a, b) => b.balance - a.balance)
  }, [periodIncomes, periodExpenses])

  const servicesCols = useMemo<GridColDef<ServiceDetailed>[]>(
    () => [
      { field: 'service_date', headerName: 'Data', minWidth: 120, flex: 1, renderCell: (p) => p.row.service_date ?? '' },
      { field: 'title', headerName: 'Título', minWidth: 220, flex: 1.5, renderCell: (p) => p.row.title ?? '' },
      {
        field: 'total_income',
        headerName: 'Entradas',
        minWidth: 130,
        flex: 1,
        renderCell: (p) => formatBRL(Number(p.row.total_income ?? 0)),
      },
      {
        field: 'total_expense',
        headerName: 'Saídas',
        minWidth: 130,
        flex: 1,
        renderCell: (p) => formatBRL(Number(p.row.total_expense ?? 0)),
      },
      {
        field: 'balance',
        headerName: 'Saldo',
        minWidth: 130,
        flex: 1,
        renderCell: (p) => formatBRL(Number(p.row.balance ?? 0)),
      },
    ],
    []
  )

  const memberCols = useMemo<GridColDef<any>[]>(
    () => [
      {
        field: 'received_at',
        headerName: 'Data',
        minWidth: 170,
        flex: 1,
        renderCell: (p) => (p.row.received_at ? new Date(p.row.received_at).toLocaleString('pt-BR') : '-'),
      },
      { field: 'kind', headerName: 'Tipo', minWidth: 120, flex: 1, renderCell: (p) => p.row.kind ?? '' },
      {
        field: 'amount',
        headerName: 'Valor',
        minWidth: 120,
        flex: 1,
        renderCell: (p) => formatBRL(Number(p.row.amount ?? 0)),
      },
      {
        field: 'service_title',
        headerName: 'Culto/Evento',
        minWidth: 200,
        flex: 1.2,
        renderCell: (p) => p.row.service_title ?? '',
      },
      { field: 'note', headerName: 'Obs', minWidth: 220, flex: 1.5, renderCell: (p) => p.row.note ?? '' },
    ],
    []
  )

  const catCols = useMemo<GridColDef<any>[]>(
    () => [
      { field: 'category_name', headerName: 'Categoria', minWidth: 220, flex: 1.5 },
      { field: 'count', headerName: 'Registros', minWidth: 120, flex: 1 },
      {
        field: 'total',
        headerName: 'Total',
        minWidth: 140,
        flex: 1,
        renderCell: (p) => formatBRL(Number(p.row.total ?? 0)),
      },
    ],
    []
  )

  const svcPeriodCols = useMemo<GridColDef<any>[]>(
    () => [
      { field: 'service_title', headerName: 'Culto/Evento', minWidth: 240, flex: 1.6 },
      {
        field: 'total_income',
        headerName: 'Entradas',
        minWidth: 130,
        flex: 1,
        renderCell: (p) => formatBRL(Number(p.row.total_income ?? 0)),
      },
      {
        field: 'total_expense',
        headerName: 'Saídas',
        minWidth: 130,
        flex: 1,
        renderCell: (p) => formatBRL(Number(p.row.total_expense ?? 0)),
      },
      {
        field: 'balance',
        headerName: 'Saldo',
        minWidth: 130,
        flex: 1,
        renderCell: (p) => formatBRL(Number(p.row.balance ?? 0)),
      },
    ],
    []
  )

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Relatórios avançados</Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Resumo por período" />
        <Tab label="Por culto/evento" />
        <Tab label="Por membro" />
      </Tabs>

      <Divider sx={{ my: 2 }} />

      {tab === 0 ? (
        <Box>
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
            <TextField
              label="De"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!dateError}
              helperText={dateError ? dateError : ' '}
            />
            <TextField
              label="Até"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!dateError}
              helperText={dateError ? dateError : ' '}
            />
            <Button variant="contained" onClick={runPeriod} disabled={loadingPeriod}>
              {loadingPeriod ? 'Gerando...' : 'Gerar resumo'}
            </Button>

            {loadingPeriod ? <CircularProgress size={20} /> : null}
          </Box>

          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            }}
          >
            <Box sx={{ background: '#fff', borderRadius: 1, p: 2 }}>
              <Typography sx={{ opacity: 0.7 }}>Entradas</Typography>
              <Typography variant="h6">{formatBRL(periodTotals.totalIncome)}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {periodIncomes.length} registro(s)
              </Typography>
            </Box>

            <Box sx={{ background: '#fff', borderRadius: 1, p: 2 }}>
              <Typography sx={{ opacity: 0.7 }}>Saídas</Typography>
              <Typography variant="h6">{formatBRL(periodTotals.totalExpense)}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {periodExpenses.length} registro(s)
              </Typography>
            </Box>

            <Box sx={{ background: '#fff', borderRadius: 1, p: 2 }}>
              <Typography sx={{ opacity: 0.7 }}>Saldo</Typography>
              <Typography variant="h6">{formatBRL(periodTotals.balance)}</Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Top categorias (saídas)
            </Typography>

            <Box sx={{ height: 360, width: '100%', background: '#fff', borderRadius: 1 }}>
              <DataGrid
                rows={topCategories.map((r, i) => ({ id: `${r.category_name}-${i}`, ...r }))}
                columns={catCols}
                disableRowSelectionOnClick
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                pageSizeOptions={[10, 25, 50]}
                loading={loadingPeriod}
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ p: 2, opacity: 0.8 }}>
                      {periodHasResults
                        ? 'Nenhuma saída no período (logo não há categorias).'
                        : 'Gere um resumo por período para ver as categorias.'}
                    </Box>
                  ),
                }}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Por culto/evento no período (saldo)
            </Typography>

            <Box sx={{ height: 420, width: '100%', background: '#fff', borderRadius: 1 }}>
              <DataGrid
                rows={topServicesInPeriod.map((r, i) => ({ id: `${r.service_title}-${i}`, ...r }))}
                columns={svcPeriodCols}
                disableRowSelectionOnClick
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } },
                  sorting: { sortModel: [{ field: 'balance', sort: 'desc' }] },
                }}
                pageSizeOptions={[10, 25, 50]}
                loading={loadingPeriod}
                slots={{
                  noRowsOverlay: () => (
                    <Box sx={{ p: 2, opacity: 0.8 }}>
                      {periodHasResults
                        ? 'Sem cultos/eventos vinculados no período.'
                        : 'Gere um resumo por período para ver os cultos/eventos.'}
                    </Box>
                  ),
                }}
              />
            </Box>
          </Box>
        </Box>
      ) : tab === 1 ? (
        <Box>
          <Box display="flex" gap={1} alignItems="center" mb={2}>
            <Button variant="outlined" onClick={loadServicesTotals} disabled={loadingServices}>
              {loadingServices ? 'Carregando...' : 'Atualizar'}
            </Button>
            {loadingServices ? <CircularProgress size={20} /> : null}
          </Box>

          <Box sx={{ height: 560, width: '100%', background: '#fff', borderRadius: 1 }}>
            <DataGrid
              rows={services}
              columns={servicesCols}
              loading={loadingServices}
              getRowId={(r) => r.id}
              disableRowSelectionOnClick
              initialState={{
                pagination: { paginationModel: { pageSize: 25, page: 0 } },
                sorting: { sortModel: [{ field: 'service_date', sort: 'desc' }] },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              slots={{
                noRowsOverlay: () => <Box sx={{ p: 2, opacity: 0.8 }}>Nenhum culto/evento encontrado.</Box>,
              }}
            />
          </Box>
        </Box>
      ) : (
        <Box>
          <Autocomplete
            options={members}
            loading={membersLoading}
            value={selectedMember}
            onChange={(_, v) => {
              const id = v?.id ?? ''
              setMemberId(id)
              if (id) loadMemberHistory(id)
              else setMemberRows([])
            }}
            isOptionEqualToValue={(opt, v) => opt.id === v.id}
            getOptionLabel={(opt) => opt?.full_name ?? opt?.name ?? opt?.id ?? ''}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Selecione um membro"
                helperText="Mostra o histórico de entradas do membro (dízimos/ofertas/outros)."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {membersLoading ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <Box sx={{ mt: 2, height: 560, width: '100%', background: '#fff', borderRadius: 1 }}>
            <DataGrid
              rows={memberRows}
              columns={memberCols}
              loading={memberRowsLoading}
              getRowId={(r) => r.id}
              disableRowSelectionOnClick
              initialState={{
                pagination: { paginationModel: { pageSize: 25, page: 0 } },
                sorting: { sortModel: [{ field: 'received_at', sort: 'desc' }] },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              slots={{
                noRowsOverlay: () => (
                  <Box sx={{ p: 2, opacity: 0.8 }}>
                    {!memberId ? 'Selecione um membro para ver o histórico.' : 'Nenhuma entrada encontrada para este membro.'
                    }
                  </Box>
                ),
              }}
            />
          </Box>
        </Box>
      )}

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
