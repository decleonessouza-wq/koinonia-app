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
  CircularProgress,
} from '@mui/material'
import {
  createMember,
  deleteMember,
  generateMemberLinkCodeForCurrentChurch,
  getMembers,
  updateMember,
  type MemberRow,
} from '../../services/treasuryApi'

function formatDateTimeBR(v: any) {
  if (!v) return '-'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleString('pt-BR')
}

function normalizeText(v: string) {
  return (v ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export default function Membros() {
  const [rows, setRows] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [editing, setEditing] = useState<MemberRow | null>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [linkCode, setLinkCode] = useState('')
  const [generatingLink, setGeneratingLink] = useState(false)

  // busca
  const [query, setQuery] = useState('')

  // confirmação de delete
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MemberRow | null>(null)

  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false,
    msg: '',
    severity: 'success',
  })

  async function load() {
    setLoading(true)
    try {
      const data = await getMembers()
      setRows(data ?? [])
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao carregar membros', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setEditing(null)
    setFullName('')
    setPhone('')
    setLinkCode('')
  }

  function closeDialog() {
    if (saving) return
    setOpen(false)
    resetForm()
  }

  function openNew() {
    resetForm()
    setOpen(true)
  }

  function openEdit(row: MemberRow) {
    setEditing(row)
    setFullName(row.full_name ?? '')
    setPhone(row.phone ?? '')
    setLinkCode(row.link_code ?? '')
    setOpen(true)
  }

  async function onGenerateLink() {
    setGeneratingLink(true)
    try {
      const code = await generateMemberLinkCodeForCurrentChurch(6)
      setLinkCode((code ?? '').toString().toUpperCase())
      setSnack({ open: true, msg: 'Link code gerado.', severity: 'success' })
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao gerar link code', severity: 'error' })
    } finally {
      setGeneratingLink(false)
    }
  }

  async function onSave() {
    const name = fullName.trim()
    if (!name) {
      setSnack({ open: true, msg: 'Informe o nome completo.', severity: 'error' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        full_name: name,
        phone: phone.trim() ? phone.trim() : null,
        link_code: linkCode.trim() ? linkCode.trim().toUpperCase() : null,
      }

      if (editing?.id) {
        await updateMember(editing.id, payload)
        setSnack({ open: true, msg: 'Membro atualizado com sucesso!', severity: 'success' })
      } else {
        await createMember(payload)
        setSnack({ open: true, msg: 'Membro cadastrado com sucesso!', severity: 'success' })
      }

      setOpen(false)
      resetForm()
      await load()
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao salvar membro (RLS/permissões).', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  function askDelete(row: MemberRow) {
    setDeleteTarget(row)
    setDeleteOpen(true)
  }

  async function confirmDelete() {
    if (!deleteTarget?.id) return
    setDeleting(true)
    try {
      await deleteMember(deleteTarget.id)
      setSnack({ open: true, msg: 'Membro excluído.', severity: 'success' })
      setDeleteOpen(false)
      setDeleteTarget(null)
      await load()
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao excluir membro (RLS/permissões).', severity: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredRows = useMemo(() => {
    const q = normalizeText(query)
    if (!q) return rows
    return (rows ?? []).filter((r) => {
      const hay = normalizeText(
        `${r.full_name ?? ''} ${r.phone ?? ''} ${r.link_code ?? ''} ${r.created_at ?? ''}`
      )
      return hay.includes(q)
    })
  }, [rows, query])

  const columns = useMemo<GridColDef<MemberRow>[]>(
    () => [
      { field: 'full_name', headerName: 'Nome', flex: 1.4, minWidth: 220, renderCell: (p) => p.row.full_name ?? '' },
      { field: 'phone', headerName: 'Telefone', flex: 1, minWidth: 150, renderCell: (p) => p.row.phone ?? '' },
      {
        field: 'link_code',
        headerName: 'Link code',
        flex: 0.8,
        minWidth: 120,
        renderCell: (p) => p.row.link_code ?? '',
      },
      {
        field: 'created_at',
        headerName: 'Criado em',
        flex: 1,
        minWidth: 170,
        renderCell: (p) => formatDateTimeBR(p.row.created_at),
      },
      {
        field: 'actions',
        headerName: 'Ações',
        sortable: false,
        filterable: false,
        minWidth: 220,
        renderCell: (p) => (
          <Box display="flex" gap={1}>
            <Button size="small" variant="outlined" onClick={() => openEdit(p.row)}>
              Editar
            </Button>
            <Button size="small" color="error" variant="outlined" onClick={() => askDelete(p.row)}>
              Excluir
            </Button>
          </Box>
        ),
      },
    ],
    []
  )

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} gap={2} flexWrap="wrap">
        <Typography variant="h4">Membros</Typography>

        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          <TextField
            size="small"
            label="Buscar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome, telefone, link code..."
          />

          <Button variant="outlined" onClick={load} disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar'}
          </Button>

          <Button variant="contained" onClick={openNew} disabled={loading}>
            Novo membro
          </Button>
        </Box>
      </Box>

      <Box sx={{ height: 560, width: '100%', background: '#fff', borderRadius: 1 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          getRowId={(r) => r.id}
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
            sorting: { sortModel: [{ field: 'created_at', sort: 'desc' }] },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ p: 2, opacity: 0.8 }}>
                {query?.trim()
                  ? 'Nenhum membro encontrado para este filtro.'
                  : 'Nenhum membro cadastrado ainda. Clique em “Novo membro”.'}
              </Box>
            ),
          }}
        />
      </Box>

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar membro' : 'Novo membro'}</DialogTitle>
        <DialogContent>
          <Box display="grid" gap={2} mt={1}>
            <TextField
              label="Nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              autoFocus
            />

            <TextField
              label="Telefone (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              helperText="Ex.: (11) 99999-9999"
            />

            <Box display="grid" gap={1}>
              <TextField
                label="Link code (opcional)"
                value={linkCode}
                onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                fullWidth
                helperText="Pode ser gerado automaticamente (botão abaixo) ou digitado manualmente."
              />

              <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                <Button variant="outlined" onClick={onGenerateLink} disabled={generatingLink || saving}>
                  {generatingLink ? 'Gerando...' : 'Gerar link code'}
                </Button>

                {generatingLink ? <CircularProgress size={18} /> : null}

                <Button
                  variant="text"
                  onClick={() => setLinkCode('')}
                  disabled={generatingLink || saving || !linkCode}
                >
                  Limpar
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={onSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Excluir membro</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o membro{' '}
            <b>{deleteTarget?.full_name ?? '—'}</b>?
          </Typography>
          <Typography sx={{ mt: 1, opacity: 0.75 }} variant="body2">
            Essa ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir'}
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
