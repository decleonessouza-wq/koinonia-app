import { Card, CardContent, Typography, Grid } from '@mui/material'
import { useEffect, useState } from 'react'
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
import {
  getChurchBalance,
  getChurchBalanceMonthly,
} from '../../services/treasuryApi'

type Summary = {
  income: number
  expense: number
  balance: number
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [monthly, setMonthly] = useState<any[]>([])

  useEffect(() => {
    getChurchBalance().then(setSummary)
    getChurchBalanceMonthly().then(setMonthly)
  }, [])

  if (!summary) return null

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Tesouraria · Dashboard
      </Typography>

      {/* Cards resumo */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography>Entradas (Total)</Typography>
              <Typography variant="h5">
                R$ {summary.income.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography>Saídas (Total)</Typography>
              <Typography variant="h5">
                R$ {summary.expense.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography>Saldo</Typography>
              <Typography variant="h5">
                R$ {summary.balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráfico Entradas x Saídas */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Entradas x Saídas (Mensal)
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthly}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" name="Entradas" />
          <Bar dataKey="expense" name="Saídas" />
        </BarChart>
      </ResponsiveContainer>

      {/* Gráfico Saldo */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Saldo (Mensal)
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthly}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line dataKey="balance" name="Saldo" />
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}
