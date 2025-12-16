import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts'
import { getChurchBalance, getChurchBalanceMonthly } from '../../services/treasuryApi'

type Summary = {
  income: number
  expense: number
  balance: number
}

type MonthlyRow = {
  month: string | Date | null
  income: number | null
  expense: number | null
  balance: number | null
}

type MonthlyRowWithLabel = MonthlyRow & {
  month_label: string
}

function asNumber(v: unknown, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatMonthLabel(monthValue: unknown) {
  // month pode vir como "2025-12-01" (date) ou string semelhante
  if (!monthValue) return ''
  const d = new Date(String(monthValue))
  if (Number.isNaN(d.getTime())) return String(monthValue)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${mm}/${yyyy}`
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [monthly, setMonthly] = useState<MonthlyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function load() {
    setLoading(true)
    setErrorMsg('')
    try {
      const [s, m] = await Promise.all([getChurchBalance(), getChurchBalanceMonthly()])

      const safeSummary: Summary = {
        income: asNumber((s as any)?.income, 0),
        expense: asNumber((s as any)?.expense, 0),
        balance: asNumber((s as any)?.balance, 0),
      }

      const safeMonthly: MonthlyRow[] = (m ?? []).map((r: any) => ({
        month: (r?.month ?? null) as MonthlyRow['month'],
        income: r?.income ?? null,
        expense: r?.expense ?? null,
        balance: r?.balance ?? null,
      }))

      setSummary(safeSummary)
      setMonthly(safeMonthly)
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!active) return
      await load()
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const monthlyWithLabel = useMemo<MonthlyRowWithLabel[]>(() => {
    return (monthly ?? []).map((r) => ({
      ...r,
      // garante que o gráfico sempre tem números
      income: asNumber(r.income, 0),
      expense: asNumber(r.expense, 0),
      balance: asNumber(r.balance, 0),
      month_label: formatMonthLabel(r.month),
    }))
  }, [monthly])

  const hasMonthlyData = monthlyWithLabel.length > 0

  if (loading) {
    return (
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4">Tesouraria · Dashboard</Typography>
          <Button variant="outlined" disabled>
            Atualizar
          </Button>
        </Box>
        <Typography>Carregando...</Typography>
      </Box>
    )
  }

  if (errorMsg) {
    return (
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4">Tesouraria · Dashboard</Typography>
          <Button variant="outlined" onClick={load}>
            Tentar novamente
          </Button>
        </Box>
        <Typography color="error">{errorMsg}</Typography>
      </Box>
    )
  }

  if (!summary) return null

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Tesouraria · Dashboard</Typography>
        <Button variant="outlined" onClick={load} disabled={loading}>
          Atualizar
        </Button>
      </Box>

      {/* Cards resumo (sem Grid do MUI para evitar erro de tipagem) */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        }}
      >
        <Card>
          <CardContent>
            <Typography>Entradas (Total)</Typography>
            <Typography variant="h5">{formatBRL(asNumber(summary.income, 0))}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography>Saídas (Total)</Typography>
            <Typography variant="h5">{formatBRL(asNumber(summary.expense, 0))}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography>Saldo</Typography>
            <Typography variant="h5">{formatBRL(asNumber(summary.balance, 0))}</Typography>
          </CardContent>
        </Card>
      </Box>

      {!hasMonthlyData ? (
        <Box mt={4}>
          <Typography variant="h6">Gráficos</Typography>
          <Typography color="text.secondary">Ainda não há dados mensais suficientes para exibir gráficos.</Typography>
        </Box>
      ) : (
        <>
          {/* Gráfico Entradas x Saídas */}
          <Typography variant="h6" sx={{ mt: 4 }}>
            Entradas x Saídas (Mensal)
          </Typography>

          <Box sx={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyWithLabel}>
                <XAxis dataKey="month_label" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => formatBRL(asNumber(value, 0))}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Legend />
                <Bar dataKey="income" name="Entradas" />
                <Bar dataKey="expense" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Gráfico Saldo */}
          <Typography variant="h6" sx={{ mt: 4 }}>
            Saldo (Mensal)
          </Typography>

          <Box sx={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyWithLabel}>
                <XAxis dataKey="month_label" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => formatBRL(asNumber(value, 0))}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Legend />
                <Line dataKey="balance" name="Saldo" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </>
      )}
    </Box>
  )
}
