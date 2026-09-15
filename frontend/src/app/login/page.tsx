'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    params?.get('expired') ? 'Your session expired. Please sign in again.' : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      const next = params?.get('next');
      router.replace(next && next.startsWith('/') ? next : '/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 423
            ? 'Account locked after repeated failed attempts. Try again in 15 minutes.'
            : err.status === 429
              ? 'Too many sign-in attempts. Please wait a few minutes before retrying.'
              : err.message
        );
      } else {
        setError('Unable to sign in right now. Please try again.');
      }
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-cyan-gradient p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(34,211,238,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(6,182,212,0.25), transparent 40%)',
          }}
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 ring-1 ring-cyan-300/40">
            <ShieldCheck className="h-6 w-6 text-cyan-300" aria-hidden="true" />
          </span>
          <span className="text-2xl font-bold tracking-tight text-white">LM-Verify</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-3xl font-bold leading-tight text-white">
            Automated compliance verification for packaged commodities
          </h1>
          <p className="mt-4 text-cyan-100/90">
            Deterministic checks against the Legal Metrology (Packaged Commodities) Rules, 2011 — with
            statutory citations, officer overrides and an evidentiary audit trail on every verdict.
          </p>

          <dl className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: '28+', label: 'Rules evaluated' },
              { value: '30+', label: 'Product categories' },
              { value: '4', label: 'Verdict states' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/8 p-4 ring-1 ring-white/10">
                <dt className="text-2xl font-bold text-cyan-300">{stat.value}</dt>
                <dd className="mt-1 text-xs text-cyan-100/80">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="relative text-xs text-cyan-200/70">
          Authorised use only. All sign-in attempts and adjudications are logged.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-[var(--app-bg)] px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-gradient ring-1 ring-cyan-300/40">
              <ShieldCheck className="h-5 w-5 text-cyan-100" aria-hidden="true" />
            </span>
            <span className="text-xl font-bold tracking-tight text-cyan-950">LM-Verify</span>
          </div>

          <div className="card p-8">
            <h2 className="text-xl font-bold text-cyan-950">Officer sign in</h2>
            <p className="mt-1 text-sm text-slate-500">
              Use the credentials issued by your Legal Metrology Controller.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2.5 rounded-lg border border-verdict-fail/25 bg-verdict-fail/5 p-3 text-sm text-verdict-fail"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="email" className="label">
                  Official email address
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-600"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@lmverify.gov.in"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-600"
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-cyan-50 hover:text-cyan-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                disabled={!email || !password}
              >
                {isSubmitting ? 'Verifying…' : 'Sign in securely'}
              </Button>
            </form>

            <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Lock className="h-3 w-3 text-cyan-600" aria-hidden="true" />
              Session protected by short-lived tokens and rotating refresh cookies
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Accounts are provisioned by a Controller. Five failed attempts lock the account for 15
            minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cyan-gradient" />}>
      <LoginForm />
    </Suspense>
  );
}
