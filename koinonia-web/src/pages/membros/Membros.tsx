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
      setLinkCode(code ?? '')
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

  async function onDelete(row: MemberRow) {
    const ok = window.confirm(`Excluir o membro "${row.full_name}"?`)
    if (!ok) return

    try {
      await deleteMember(row.id)
      setSnack({ open: true, msg: 'Membro excluído.', severity: 'success' })
      await load()
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message ?? 'Erro ao excluir membro (RLS/permissões).', severity: 'error' })
    }
  }

  useEffect(() => {
    load()
  }, [])

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
            <Button size="small" color="error" variant="outlined" onClick={() => onDelete(p.row)}>
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
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Membros</Typography>

        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={load} disabled={loading}>
            Atualizar
          </Button>
          <Button variant="contained" onClick={openNew} disabled={loading}>
            Novo membro
          </Button>
        </Box>
      </Box>

      <Box sx={{ height: 560, width: '100%', background: '#fff', borderRadius: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(r) => r.id}
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
            sorting: { sortModel: [{ field: 'created_at', sort: 'desc' }] },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </Box>

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
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

              <Box display="flex" gap={1}>
                <Button variant="outlined" onClick={onGenerateLink} disabled={generatingLink || saving}>
                  {generatingLink ? 'Gerando...' : 'Gerar link code'}
                </Button>
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
