import { supabase } from '../lib/supabaseClient'

export async function getChurchBalance() {
  const { data, error } = await supabase.from('v_church_balance').select('*').single()
  if (error) throw error
  return data
}

export async function getChurchBalanceMonthly() {
  const { data, error } = await supabase.from('v_church_balance_monthly').select('*').order('month')
  if (error) throw error
  return data
}

export async function getContributions() {
  const { data, error } = await supabase
    .from('v_contributions_detailed')
    .select('*')
    .order('received_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getExpenses() {
  const { data, error } = await supabase
    .from('v_expenses_detailed')
    .select('*')
    .order('spent_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getContributionsDetailed() {
  const { data, error } = await supabase
    .from('v_contributions_detailed')
    .select('*')
    .order('received_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getExpensesDetailed() {
  const { data, error } = await supabase
    .from('v_expenses_detailed')
    .select('*')
    .order('spent_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export type CreateContributionInput = {
  kind: string
  amount: number
  received_at: string
  note?: string | null
  member_id?: string | null
  service_id?: string | null
  contributor_name?: string | null   // <-- aqui
}

export async function createContribution(input: CreateContributionInput) {
  const payload = {
    kind: input.kind,
    amount: input.amount,
    received_at: input.received_at,
    note: input.note ?? null,
    member_id: input.member_id ?? null,
    service_id: input.service_id ?? null,
    contributor_name: input.contributor_name ?? null, // <-- aqui
  }

  const { data, error } = await supabase
    .from('contributions')
    .insert(payload)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export type CreateExpenseInput = {
  title: string
  amount: number
  spent_at: string // ISO string
  note?: string | null
  category_id: string
  service_id?: string | null
}

export async function createExpense(input: CreateExpenseInput) {
  const payload = {
    title: input.title,
    amount: input.amount,
    spent_at: input.spent_at,
    note: input.note ?? null,
    category_id: input.category_id,
    service_id: input.service_id ?? null,
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert(payload)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export type ExpenseCategory = {
  id: string
  name: string
  church_id: string
}

export async function getExpenseCategories() {
  const { data, error } = await supabase
    .from('expense_categories')
    .select('id, full_name, phone')
    .order('name', { ascending: true })

  if (error) throw error
  return data ?? []
}

// ===== Members (select) =====

export type MemberOption = {
  id: string
  name: string
  phone: string | null
  church_id?: string | null
}

export async function getMembersForSelect(): Promise<MemberOption[]> {
  // Pega tudo pra não depender do nome exato das colunas (name/nome/full_name etc.)
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .limit(500)

  if (error) throw error

  const rows = (data ?? []) as any[]

  const mapped: MemberOption[] = rows.map((r) => {
    const name =
      r.name ??
      r.nome ??
      r.full_name ??
      r.nome_completo ??
      r.display_name ??
      r.member_name ??
      '' // fallback

    const phone =
      r.phone ??
      r.telefone ??
      r.celular ??
      r.whatsapp ??
      null

    return {
      id: r.id,
      name: String(name || '').trim() || '(Sem nome)',
      phone: phone ? String(phone) : null,
      church_id: r.church_id ?? null,
    }
  })

  // Ordena no front (evita .order('name') quebrar se a coluna não existir)
  mapped.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  return mapped
}
