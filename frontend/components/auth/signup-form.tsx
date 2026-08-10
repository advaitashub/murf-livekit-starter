'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const inputClassName =
  'w-full rounded-3xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20';

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      if (response.ok) {
        router.push('/');
      } else {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? 'Something went wrong. Please try again.');
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
              Create your account.
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              A secure account keeps your CashCompass session and voice experience private.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClassName}
                placeholder="Your full name"
                required
              />
            </div>

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
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="confirmPassword">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputClassName}
                placeholder="Repeat your password"
                required
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-white hover:text-sky-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
