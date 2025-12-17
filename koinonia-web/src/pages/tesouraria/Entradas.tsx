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
  createContribution,
  getContributionsDetailed,
  getMembersForSelect,
  getServicesForSelect,
  type MemberOption,
  type ServiceOption,
} from '../../services/treasuryApi'

type ContributionRow = {
  id: string
  received_at: string | null
  kind: string | null
  amount: number | null
  member_name: string | null
  member_phone: string | null
  service_title: string | null
  note: string | null
  contributor_ref?: string | null
  member_id?: string | null
  service_id?: string | null
}

function toInputDateTimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function parseBRLNumber(input: string) {
  // aceita "10", "10.5", "10,50", "1.234,56"
  const cleaned = String(input ?? '')
    .trim()
    .replace(/\./g, '')
    .replace(',', '.')
  const n = Number(cleaned)
  return n
}

export default function Entradas() {
  const [rows, setRows] = useState<ContributionRow[]>([])
  const [loading, setLoading] = useState(true)

  // dialog/form
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [kind, setKind] = useState<'dizimo' | 'oferta' | 'outro'>('oferta')
  const [amount, setAmount] = useState<string>('10')
  const [receivedAt, setReceivedAt] = useState<string>(toInputDateTimeLocal(new Date()))
  const [note, setNote] = useState<string>('')

  const [memberId, setMemberId] = useState<string>('')

  // ✅ service: select (autocomplete) + fallback manual SEPARADOS
  const [serviceIdSelected, setServiceIdSelected] = useState<string>('')
  const [serviceIdManual, setServiceIdManual] = useState<string>('')

  // atenção: NÃO existe a coluna contributor_ref na tabela contributions
  // por enquanto vamos salvar essa referência dentro do campo note
  const [contributorRef, setContributorRef] = useState<string>('')

  // members select
  const [members, setMembers] = useState<MemberOption[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  // services select
  const [services, setServices] = useState<ServiceOption[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)

  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false,
    msg: '',
    severity: 'success',
  })

  async function load() {
    setLoading(true)
    try {
      const data = await getContributionsDetailed()
      setRows((data ?? []) as ContributionRow[])
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao carregar entradas', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function loadMembers() {
    setMembersLoading(true)
    try {
      const data = await getMembersForSelect()
      setMembers(data ?? [])
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao carregar membros', severity: 'error' })
    } finally {
      setMembersLoading(false)
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
  }, [])

  // carrega selects quando abrir o modal (1x por sessão)
  useEffect(() => {
    if (open && members.length === 0) loadMembers()
    if (open && services.length === 0) loadServices()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedMember = useMemo(() => {
    if (!memberId) return null
    return members.find((m) => m.id === memberId) ?? null
  }, [memberId, members])

  const selectedService = useMemo(() => {
    if (!serviceIdSelected) return null
    return services.find((s) => s.id === serviceIdSelected) ?? null
  }, [serviceIdSelected, services])

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'received_at',
        headerName: 'Data',
        flex: 1,
        minWidth: 170,
        renderCell: (params: any) => {
          const v = params?.row?.received_at as string | null | undefined
          if (!v) return '-'
          return new Date(v).toLocaleString('pt-BR')
        },
      },
      {
        field: 'kind',
        headerName: 'Tipo',
        flex: 1,
        minWidth: 120,
        renderCell: (params: any) => params?.row?.kind ?? '',
      },
      {
        field: 'amount',
        headerName: 'Valor',
        flex: 1,
        minWidth: 120,
        renderCell: (params: any) => formatBRL(Number(params?.row?.amount ?? 0)),
      },
      {
        field: 'member_name',
        headerName: 'Membro',
        flex: 1,
        minWidth: 160,
        renderCell: (params: any) => params?.row?.member_name ?? '',
      },
      {
        field: 'member_phone',
        headerName: 'Telefone',
        flex: 1,
        minWidth: 140,
        renderCell: (params: any) => params?.row?.member_phone ?? '',
      },
      {
        field: 'service_title',
        headerName: 'Culto/Evento',
        flex: 1,
        minWidth: 180,
        renderCell: (params: any) => params?.row?.service_title ?? '',
      },
      {
        field: 'note',
        headerName: 'Observação',
        flex: 1.2,
        minWidth: 220,
        renderCell: (params: any) => params?.row?.note ?? '',
      },
    ],
    []
  )

  function resetForm() {
    setKind('oferta')
    setAmount('10')
    setReceivedAt(toInputDateTimeLocal(new Date()))
    setNote('')
    setMemberId('')
    setServiceIdSelected('')
    setServiceIdManual('')
    setContributorRef('')
  }

  async function onSave() {
    const parsedAmount = parseBRLNumber(amount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setSnack({ open: true, msg: 'Informe um valor válido (maior que 0).', severity: 'error' })
      return
    }
    if (!receivedAt) {
      setSnack({ open: true, msg: 'Informe a data/hora do recebimento.', severity: 'error' })
      return
    }

    const receivedDate = new Date(receivedAt)
    if (Number.isNaN(receivedDate.getTime())) {
      setSnack({ open: true, msg: 'Data/Hora inválida. Verifique o campo e tente novamente.', severity: 'error' })
      return
    }

    // ✅ prioridade: fallback manual > selecionado
    const finalServiceId = serviceIdManual.trim() ? serviceIdManual.trim() : serviceIdSelected.trim() ? serviceIdSelected.trim() : null

    setSaving(true)
    try {
      const iso = receivedDate.toISOString()

      // guarda contributorRef no note para não quebrar o insert
      const ref = contributorRef.trim()
      const obs = note.trim()
      const finalNote = ref && obs ? `Ref: ${ref}\n${obs}` : ref ? `Ref: ${ref}` : obs ? obs : null

      await createContribution({
        kind,
        amount: parsedAmount,
        received_at: iso,
        note: finalNote,
        member_id: memberId.trim() ? memberId.trim() : null,
        service_id: finalServiceId,
      })

      setSnack({ open: true, msg: 'Entrada cadastrada com sucesso!', severity: 'success' })
      setOpen(false)
      resetForm()
      await load()
    } catch (e: any) {
      setSnack({
        open: true,
        msg: e?.message ?? 'Erro ao cadastrar entrada (verifique permissões/RLS).',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Entradas</Typography>

        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={load} disabled={loading}>
            Atualizar
          </Button>
          <Button variant="contained" onClick={() => setOpen(true)} disabled={loading}>
            Nova entrada
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
            sorting: { sortModel: [{ field: 'received_at', sort: 'desc' }] },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </Box>

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nova entrada</DialogTitle>
        <DialogContent>
          <Box display="grid" gap={2} mt={1}>
            <TextField select label="Tipo" value={kind} onChange={(e) => setKind(e.target.value as any)} fullWidth>
              <MenuItem value="dizimo">Dízimo</MenuItem>
              <MenuItem value="oferta">Oferta</MenuItem>
              <MenuItem value="outro">Outro</MenuItem>
            </TextField>

            <TextField
              label="Valor (R$)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="text"
              fullWidth
              helperText="Aceita vírgula. Ex.: 10,50"
            />

            <TextField
              label="Data/Hora do recebimento"
              value={receivedAt}
              onChange={(e) => setReceivedAt(e.target.value)}
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

            {/* Select de Membros */}
            <Autocomplete
              options={members}
              loading={membersLoading}
              value={selectedMember}
              onChange={(_, v) => setMemberId(v?.id ?? '')}
              isOptionEqualToValue={(opt, v) => opt.id === v.id}
              getOptionLabel={(opt) => opt?.full_name ?? opt?.name ?? opt?.id ?? ''}
              renderOption={(props, opt) => (
                <li {...props} key={opt.id}>
                  <Box display="flex" flexDirection="column">
                    <Typography fontSize={14}>{opt.full_name ?? opt.name ?? '(Sem nome)'}</Typography>
                    <Typography fontSize={12} color="text.secondary">
                      {opt.phone ?? opt.id}
                    </Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Membro (opcional)"
                  fullWidth
                  helperText="Selecione um membro (busca por nome)."
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

            {/* Select de Culto/Evento */}
            <Autocomplete
              options={services}
              loading={servicesLoading}
              value={selectedService}
              onChange={(_, v) => setServiceIdSelected(v?.id ?? '')}
              isOptionEqualToValue={(opt, v) => opt.id === v.id}
              getOptionLabel={(opt) => opt?.title ?? opt?.id ?? ''}
              renderOption={(props, opt) => (
                <li {...props} key={opt.id}>
                  <Box display="flex" flexDirection="column">
                    <Typography fontSize={14}>{opt.title ?? '(Sem título)'}</Typography>
                    <Typography fontSize={12} color="text.secondary">
                      {opt.service_date ?? ''}{' '}
                      {opt.starts_at ? `· ${new Date(opt.starts_at).toLocaleString('pt-BR')}` : ''}
                    </Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Culto/Evento (opcional)"
                  fullWidth
                  helperText="Selecione um culto/evento para vincular esta entrada."
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

            {/* fallback manual (mantém o fluxo) */}
            <TextField
              label="Service ID (opcional, UUID) — fallback manual"
              value={serviceIdManual}
              onChange={(e) => setServiceIdManual(e.target.value)}
              fullWidth
              helperText="Se preencher aqui, ele terá prioridade sobre o selecionado acima."
            />

            <TextField
              label="Referência do contribuidor (opcional)"
              value={contributorRef}
              onChange={(e) => setContributorRef(e.target.value)}
              fullWidth
              helperText="Será salva dentro de 'Observação' (note), pois contributor_ref não existe na tabela."
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
