import { supabase } from '../lib/supabaseClient'

export async function getChurchBalance() {
  const { data, error } = await supabase
    .from('v_church_balance')
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function getChurchBalanceMonthly() {
  const { data, error } = await supabase
    .from('v_church_balance_monthly')
    .select('*')
    .order('month')

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
