import { supabase } from '@/lib/supabase';

export type UserRole = 'member' | 'leader' | 'pastor';

export type Profile = {
  id: string;
  full_name: string | null;
  church_id: string | null;
  role: UserRole;
};

export async function getMyProfile() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, church_id, role')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateMyProfile(payload: Partial<Pick<Profile, 'full_name' | 'church_id' | 'role'>>) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', user.id)
    .select('id, full_name, church_id, role')
    .single();

  if (error) throw error;
  return data as Profile;
}
