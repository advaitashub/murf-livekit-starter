'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const inputClassName =
  'w-full rounded-3xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push('/');
      } else {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? 'Incorrect email or password.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16 sm:px-8">
        <div className="mb-10 rounded-[2rem] border border-white/10 bg-zinc-900/80 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-8 space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">CashCompass</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Welcome back.
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Sign in to continue your financial voice assistant and keep your session secure.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClassName}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClassName}
                placeholder="••••••••"
                required
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            New to CashCompass?{' '}
            <Link href="/signup" className="font-semibold text-white hover:text-sky-300">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
