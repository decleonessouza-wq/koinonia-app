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
 * Tipos (Módulo de Membros)
 * =========================
 */

export type MemberRow = {
  id: string
  church_id: string
  full_name: string
  phone: string | null
  user_id: string | null
  link_code: string | null
  created_at: string
  updated_at?: string
}

/**
 * =========================
 * Tipos (Views detalhadas)
 * =========================
 * (usados nos relatórios avançados)
 */

export type ContributionDetailedRow = {
  id: string
  received_at: string | null
  kind: string | null
  amount: number | null
  member_id?: string | null
  member_name?: string | null
  member_phone?: string | null
  service_id?: string | null
  service_title?: string | null
  note?: string | null
}

export type ExpenseDetailedRow = {
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

/**
 * =========================
 * Helpers
 * =========================
 */

function throwIfError(error: any) {
  if (error) throw error
}

/**
 * Tenta executar uma lista de RPCs (na ordem).
 * - Se a primeira não existir, tenta a próxima.
 * - Se todas falharem, cai no fallback.
 *
 * Importante: colocando PRIMEIRO as RPCs que EXISTEM no banco,
 * você para de ver 404 no console.
 */
async function tryRpcNamesOrFallback<T>(
  rpcNames: string[],
  rpcArgs: Record<string, any>,
  fallback: () => Promise<T>
): Promise<T> {
  for (const rpcName of rpcNames) {
    try {
      const { data, error } = await supabase.rpc(rpcName, rpcArgs)
      if (error) throw error
      return (data ?? []) as T
    } catch (_e) {
      // tenta o próximo
    }
  }
  return await fallback()
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
  const { data, error } = await supabase.from('v_contributions_detailed').select('*').order('received_at', { ascending: false })
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
  const { data, error } = await supabase.from('v_expenses_detailed').select('*').order('spent_at', { ascending: false })
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

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const { data, error } = await supabase.from('expense_categories').select('id,name,church_id').order('name', { ascending: true })
  throwIfError(error)
  return (data ?? []) as ExpenseCategory[]
}

export async function getMembersForSelect(): Promise<MemberOption[]> {
  const { data, error } = await supabase.from('members').select('id,full_name,phone').order('full_name', { ascending: true }).limit(500)
  throwIfError(error)

  return (data ?? []).map((r: any) => ({
    id: r.id,
    full_name: r.full_name,
    phone: r.phone ?? null,
    name: r.full_name, // compat
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
  const { data, error } = await supabase.from('v_services_detailed').select('*').order('service_date', { ascending: false })
  throwIfError(error)
  return (data ?? []) as ServiceDetailed[]
}

/**
 * =========================
 * RELATÓRIOS POR SERVICE
 * =========================
 */

export async function getContributionsDetailedByService(serviceId: string) {
  const { data, error } = await supabase.from('v_contributions_detailed').select('*').eq('service_id', serviceId).order('received_at', { ascending: false })
  throwIfError(error)
  return data
}

export async function getExpensesDetailedByService(serviceId: string) {
  const { data, error } = await supabase.from('v_expenses_detailed').select('*').eq('service_id', serviceId).order('spent_at', { ascending: false })
  throwIfError(error)
  return data
}

/**
 * =========================
 * MEMBERS (Módulo Global)
 * =========================
 */

export async function getMembers(): Promise<MemberRow[]> {
  const { data, error } = await supabase
    .from('members')
    .select('id,church_id,full_name,phone,user_id,link_code,created_at,updated_at')
    .order('created_at', { ascending: false })
    .limit(2000)
  throwIfError(error)
  return (data ?? []) as MemberRow[]
}

export async function createMember(payload: { full_name: string; phone: string | null; link_code: string | null }) {
  const { data, error } = await supabase.from('members').insert(payload).select('*').single()
  throwIfError(error)
  return data
}

export async function updateMember(
  memberId: string,
  payload: { full_name: string; phone: string | null; link_code: string | null }
) {
  const { data, error } = await supabase.from('members').update(payload).eq('id', memberId).select('*').single()
  throwIfError(error)
  return data
}

export async function deleteMember(memberId: string) {
  const { error } = await supabase.from('members').delete().eq('id', memberId)
  throwIfError(error)
  return true
}

/**
 * Opcional: RPC para gerar link_code automático.
 */
export async function getCurrentChurchId(): Promise<string> {
  const { data, error } = await supabase.rpc('current_church_id')
  throwIfError(error)
  return String(data)
}

export async function generateMemberLinkCodeForCurrentChurch(len = 6): Promise<string> {
  const churchId = await getCurrentChurchId()
  const { data, error } = await supabase.rpc('generate_member_link_code', { p_church_id: churchId, p_len: len })
  throwIfError(error)
  return String(data)
}

/**
 * =========================
 * VÍNCULO MEMBRO ↔ AUTH
 * =========================
 */

export async function bindMemberToUser(linkCode: string): Promise<{ member_id: string; full_name: string; user_id: string }> {
  const { data, error } = await supabase.rpc('bind_member_to_user', { p_link_code: linkCode })
  throwIfError(error)
  if (Array.isArray(data)) return data[0]
  return data
}

/**
 * =========================
 * RELATÓRIOS AVANÇADOS (RPCs)
 * =========================
 * Agora chamando primeiro os nomes que EXISTEM no seu banco:
 * - report_contributions_detailed_by_period
 * - report_expenses_detailed_by_period
 * - report_contributions_detailed_by_member
 *
 * Mantém compatibilidade tentando também os nomes antigos "get_*"
 * e, por fim, fallback para views.
 */

export async function getContributionsDetailedByPeriod(startIso: string, endIso: string): Promise<ContributionDetailedRow[]> {
  return await tryRpcNamesOrFallback<ContributionDetailedRow[]>(
    ['report_contributions_detailed_by_period', 'get_contributions_detailed_by_period'],
    { p_start: startIso, p_end: endIso },
    async () => {
      const { data, error } = await supabase
        .from('v_contributions_detailed')
        .select('*')
        .gte('received_at', startIso)
        .lte('received_at', endIso)
        .order('received_at', { ascending: false })
      throwIfError(error)
      return (data ?? []) as ContributionDetailedRow[]
    }
  )
}

export async function getExpensesDetailedByPeriod(startIso: string, endIso: string): Promise<ExpenseDetailedRow[]> {
  return await tryRpcNamesOrFallback<ExpenseDetailedRow[]>(
    ['report_expenses_detailed_by_period', 'get_expenses_detailed_by_period'],
    { p_start: startIso, p_end: endIso },
    async () => {
      const { data, error } = await supabase
        .from('v_expenses_detailed')
        .select('*')
        .gte('spent_at', startIso)
        .lte('spent_at', endIso)
        .order('spent_at', { ascending: false })
      throwIfError(error)
      return (data ?? []) as ExpenseDetailedRow[]
    }
  )
}

export async function getContributionsDetailedByMember(memberId: string): Promise<ContributionDetailedRow[]> {
  return await tryRpcNamesOrFallback<ContributionDetailedRow[]>(
    ['report_contributions_detailed_by_member', 'get_contributions_detailed_by_member'],
    { p_member_id: memberId },
    async () => {
      const { data, error } = await supabase
        .from('v_contributions_detailed')
        .select('*')
        .eq('member_id', memberId)
        .order('received_at', { ascending: false })
      throwIfError(error)
      return (data ?? []) as ContributionDetailedRow[]
    }
  )
}
