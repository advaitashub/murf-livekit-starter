'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type User = {
  name: string;
};

export function AuthBar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch {
        // ignored
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-zinc-950/90 px-4 py-2 text-sm text-white shadow-xl backdrop-blur-xl md:right-8 md:top-6">
      <span className="font-medium text-slate-100">Signed in as {user.name}</span>
      <Button size="sm" variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}
