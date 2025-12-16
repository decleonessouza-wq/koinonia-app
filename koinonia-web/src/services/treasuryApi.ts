import { supabase } from '../lib/supabaseClient'

/**
 * =========================
 * Tipos base (Tesouraria)
 * =========================
 */

export type ExpenseCategory = {
  id: string
  name: string
  church_id?: string
}

export type MemberOption = {
  id: string
  full_name: string
  phone: string | null
  // alguns lugares antigos podem usar "name"
  name?: string
}

export type ServiceOption = {
  id: string
  title: string
  service_date: string // date
  starts_at: string | null
  ends_at: string | null
}

export type ServiceDetailed = {
  id: string
  church_id: string
  title: string
  service_date: string
  starts_at: string | null
  ends_at: string | null
  notes: string | null
  created_at: string
  total_income: number | null
  total_expense: number | null
  balance: number | null
}

/**
 * =========================
 * Helpers
 * =========================
 */

function throwIfError(error: any) {
  if (error) throw error
}

/**
 * =========================
 * DASHBOARD
 * =========================
 */

export async function getChurchBalance() {
  const { data, error } = await supabase.from('v_church_balance').select('*').single()
  throwIfError(error)
  return data
}

export async function getChurchBalanceMonthly() {
  const { data, error } = await supabase.from('v_church_balance_monthly').select('*').order('month', { ascending: true })
  throwIfError(error)
  return data
}

/**
 * =========================
 * ENTRADAS (Contributions)
 * =========================
 */

export async function getContributionsDetailed() {
  const { data, error } = await supabase
    .from('v_contributions_detailed')
    .select('*')
    .order('received_at', { ascending: false })
  throwIfError(error)
  return data
}

export async function createContribution(payload: {
  kind: string
  amount: number
  received_at: string
  note: string | null
  member_id: string | null
  service_id: string | null
}) {
  const { data, error } = await supabase.from('contributions').insert(payload).select('*').single()
  throwIfError(error)
  return data
}

/**
 * =========================
 * SAÍDAS (Expenses)
 * =========================
 */

export async function getExpensesDetailed() {
  const { data, error } = await supabase
    .from('v_expenses_detailed')
    .select('*')
    .order('spent_at', { ascending: false })
  throwIfError(error)
  return data
}

export async function createExpense(payload: {
  title: string
  amount: number
  spent_at: string
  note: string | null
  category_id: string
  service_id: string | null
}) {
  const { data, error } = await supabase.from('expenses').insert(payload).select('*').single()
  throwIfError(error)
  return data
}

/**
 * =========================
 * SELECTS / LOOKUPS
 * =========================
 */

/** ✅ CORRIGIDO: estava selecionando colunas de members por engano */
export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const { data, error } = await supabase
    .from('expense_categories')
    .select('id,name,church_id')
    .order('name', { ascending: true })
  throwIfError(error)
  return (data ?? []) as ExpenseCategory[]
}

export async function getMembersForSelect(): Promise<MemberOption[]> {
  const { data, error } = await supabase
    .from('members')
    .select('id,full_name,phone')
    .order('full_name', { ascending: true })
    .limit(500)
  throwIfError(error)

  // mantém compatibilidade com "name" se algum componente antigo usar
  return (data ?? []).map((r: any) => ({
    id: r.id,
    full_name: r.full_name,
    phone: r.phone ?? null,
    name: r.full_name,
  })) as MemberOption[]
}

/**
 * =========================
 * SERVICES (Cultos/Eventos)
 * =========================
 */

export async function getServicesForSelect(): Promise<ServiceOption[]> {
  const { data, error } = await supabase
    .from('services')
    .select('id,title,service_date,starts_at,ends_at')
    .order('service_date', { ascending: false })
    .limit(500)
  throwIfError(error)
  return (data ?? []) as ServiceOption[]
}

export async function createService(payload: {
  title: string
  service_date: string // YYYY-MM-DD
  notes: string | null
  starts_at: string | null
  ends_at: string | null
}) {
  const { data, error } = await supabase.from('services').insert(payload).select('*').single()
  throwIfError(error)
  return data
}

export async function getServicesDetailed(): Promise<ServiceDetailed[]> {
  const { data, error } = await supabase
    .from('v_services_detailed')
    .select('*')
    .order('service_date', { ascending: false })
  throwIfError(error)
  return (data ?? []) as ServiceDetailed[]
}

/**
 * =========================
 * RELATÓRIOS POR SERVICE
 * =========================
 */

export async function getContributionsDetailedByService(serviceId: string) {
  const { data, error } = await supabase
    .from('v_contributions_detailed')
    .select('*')
    .eq('service_id', serviceId)
    .order('received_at', { ascending: false })
  throwIfError(error)
  return data
}

export async function getExpensesDetailedByService(serviceId: string) {
  const { data, error } = await supabase
    .from('v_expenses_detailed')
    .select('*')
    .eq('service_id', serviceId)
    .order('spent_at', { ascending: false })
  throwIfError(error)
  return data
}
