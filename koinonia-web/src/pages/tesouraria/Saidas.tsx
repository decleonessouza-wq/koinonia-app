import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { getExpensesDetailed } from '../../services/treasuryApi'

function formatBRL(value: unknown) {
  const n = Number(value ?? 0)
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

function formatDateTime(value: unknown) {
  if (!value) return ''
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('pt-BR')
}

export default function Saidas() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    getExpensesDetailed()
      .then((data) => {
        if (!alive) return
        setRows(Array.isArray(data) ? data : [])
      })
      .catch((e) => {
        if (!alive) return
        setError(e?.message ?? 'Falha ao carregar saídas.')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: 'spent_at', headerName: 'Data', flex: 1.1, minWidth: 170, valueFormatter: (value) => formatDateTime(value) },
      { field: 'title', headerName: 'Título', flex: 1.4, minWidth: 220 },
      { field: 'category_name', headerName: 'Categoria', flex: 1.1, minWidth: 180 },
      { field: 'amount', headerName: 'Valor', flex: 0.7, minWidth: 120, valueFormatter: (value) => formatBRL(value) },
      { field: 'service_title', headerName: 'Culto/Evento', flex: 1.2, minWidth: 180 },
      { field: 'note', headerName: 'Observação', flex: 1.4, minWidth: 220 },
      { field: 'created_by', headerName: 'Criado por', flex: 1.2, minWidth: 200 },
    ],
    []
  )

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Saídas
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 560, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
            sorting: { sortModel: [{ field: 'spent_at', sort: 'desc' }] },
          }}
        />
      </Box>
    </Box>
  )
}
