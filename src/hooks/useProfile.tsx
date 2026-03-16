import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';
import { applyThemeForSex } from '@/lib/pregnancy-data';

export interface Profile {
  id: string;
  user_id: string;
  nome: string | null;
  dum: string | null;
  sexo_bebe: string | null;
  nome_bebe: string | null;
  plano: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
    refetchInterval: 30000, // Auto-refresh every 30s to pick up plan changes from webhook
  });

  // Apply hue based on sex
  useEffect(() => {
    if (query.data?.sexo_bebe) {
      applyThemeForSex(query.data.sexo_bebe);
    }
  }, [query.data?.sexo_bebe]);

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  return { profile: query.data, isLoading: query.isLoading, updateProfile };
}
