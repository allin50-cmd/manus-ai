import { useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
  id: number;
  email: string;
  name: string;
  onboardingCompleted: boolean;
  plan: string;
  role: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error('Auth check failed');
      return res.json();
    },
    retry: false,
    staleTime: 30_000,
  });

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    queryClient.clear();
    window.location.href = '/';
  };

  return { user: user ?? null, isLoading, logout };
}
