import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

function formatMoneyBR(value) {
  const n = Number(value ?? 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function TreasuryDashboard() {
  const [loading, setLoading] = useState(true);
  const [balanceRow, setBalanceRow] = useState(null);
  const [monthlyRows, setMonthlyRows] = useState([]);
  const [err, setErr] = useState(null);

  async function load() {
    setLoading(true);
    setErr(null);

    // 1) Saldo atual (view)
    const { data: balanceData, error: balanceError } = await supabase
      .from("v_church_balance")
      .select("*")
      .limit(1);

    if (balanceError) {
      setErr(balanceError.message);
      setLoading(false);
      return;
    }

    // 2) Série mensal (view)
    const { data: monthlyData, error: monthlyError } = await supabase
      .from("v_church_balance_monthly")
      .select("*")
      .order("month", { ascending: true });

    if (monthlyError) {
      setErr(monthlyError.message);
      setLoading(false);
      return;
    }

    setBalanceRow(balanceData?.[0] ?? null);
    setMonthlyRows(monthlyData ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const chartData = useMemo(() => {
    // Tenta ser resiliente a nomes de coluna:
    // - month (date/text)
    // - income / expense / balance (numeric)
    return (monthlyRows ?? []).map((r) => ({
      month: String(r.month ?? r.month_label ?? r.year_month ?? ""),
      income: Number(r.income ?? r.total_income ?? 0),
      expense: Number(r.expense ?? r.total_expense ?? 0),
      balance: Number(r.balance ?? 0),
    }));
  }, [monthlyRows]);

  const totals = useMemo(() => {
    const income = Number(balanceRow?.income ?? balanceRow?.total_income ?? 0);
    const expense = Number(balanceRow?.expense ?? balanceRow?.total_expense ?? 0);
    const balance = Number(balanceRow?.balance ?? (income - expense));
    return { income, expense, balance };
  }, [balanceRow]);

  if (loading) {
    return <div style={{ padding: 24, fontFamily: "system-ui" }}>Carregando Tesouraria...</div>;
  }

  if (err) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui", color: "crimson" }}>
        Erro: {err}
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Tesouraria • Dashboard</h1>
        <button onClick={load}>Atualizar</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
        <Card title="Entradas (Total)" value={formatMoneyBR(totals.income)} />
        <Card title="Saídas (Total)" value={formatMoneyBR(totals.expense)} />
        <Card title="Saldo" value={formatMoneyBR(totals.balance)} />
      </div>

      <div style={{ marginTop: 18 }}>
        <h2 style={{ marginBottom: 8 }}>Entradas x Saídas (Mensal)</h2>
        <div style={{ width: "100%", height: 320, border: "1px solid #222", borderRadius: 12, padding: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" name="Entradas" />
              <Bar dataKey="expense" name="Saídas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h2 style={{ marginBottom: 8 }}>Saldo (Mensal)</h2>
        <div style={{ width: "100%", height: 320, border: "1px solid #222", borderRadius: 12, padding: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="balance" name="Saldo" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h2 style={{ marginBottom: 8 }}>Tabela mensal</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th>Mês</Th>
                <Th>Entradas</Th>
                <Th>Saídas</Th>
                <Th>Saldo</Th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((r, idx) => (
                <tr key={idx}>
                  <Td>{r.month}</Td>
                  <Td>{formatMoneyBR(r.income)}</Td>
                  <Td>{formatMoneyBR(r.expense)}</Td>
                  <Td>{formatMoneyBR(r.balance)}</Td>
                </tr>
              ))}
              {chartData.length === 0 && (
                <tr>
                  <Td colSpan={4}>Sem dados mensais ainda.</Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ opacity: 0.7, marginTop: 18 }}>
        Observação: este painel usa as views (v_church_balance, v_church_balance_monthly) e depende do seu RLS.
      </p>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{ border: "1px solid #222", borderRadius: 12, padding: 12 }}>
      <div style={{ opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #222" }}>
      {children}
    </th>
  );
}

function Td({ children, colSpan }) {
  return (
    <td colSpan={colSpan} style={{ padding: 10, borderBottom: "1px solid #222" }}>
      {children}
    </td>
  );
}
