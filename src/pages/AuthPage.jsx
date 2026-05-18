import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSonicAuth } from '@/lib/SonicAuthContext';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function AuthPage({ embedded = false, title, subtitle }) {
  const [mode, setMode] = useState('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, loginWithGoogle } = useSonicAuth();

  useEffect(() => {
    if (!googleClientId) return;

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          try {
            setError('');
            setIsSubmitting(true);
            await loginWithGoogle(response.credential);
          } catch (authError) {
            setError(authError.message);
          } finally {
            setIsSubmitting(false);
          }
        },
      });
    };

    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.body.appendChild(script);
  }, [loginWithGoogle, mode]);

  const handleGoogleClick = () => {
    if (!googleClientId) {
      return;
    }

    if (!window.google?.accounts?.id) {
      setError('Google Sign-In is still loading. Try again in a moment.');
      return;
    }

    setError('');
    window.google.accounts.id.prompt();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ displayName, email, password });
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`${embedded ? '' : 'min-h-screen'} bg-background/80 text-foreground flex items-center justify-center p-4`}>
      {!embedded && <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(139,92,246,0.18),transparent_26%),radial-gradient(circle_at_75%_20%,rgba(37,99,235,0.12),transparent_30%)]" />}
      {embedded && <div className="absolute inset-0 -z-10 backdrop-blur-md bg-background/55" />}

      <div className="relative w-full max-w-[528px]">
        {!embedded && <button className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>}

        <section className="rounded-2xl border border-border bg-card/75 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-5 text-primary">
            <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
              <Music2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold tracking-[0.18em] uppercase">SonicFlow</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            {title || (mode === 'login' ? 'Sign in' : 'Create account')}
          </h1>
          <p className="text-muted-foreground mb-7">
            {subtitle || (mode === 'login'
              ? 'Use your account to save playlists and profile data.'
              : 'Create your SonicFlow account and start building your library.')}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button
              type="button"
              variant={mode === 'login' ? 'secondary' : 'outline'}
              className="h-12 rounded-xl"
              onClick={() => setMode('login')}
            >
              Login
            </Button>
            <Button
              type="button"
              variant={mode === 'register' ? 'secondary' : 'outline'}
              className="h-12 rounded-xl"
              onClick={() => setMode('register')}
            >
              Register
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <Input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Name"
                className="h-12 rounded-xl bg-secondary/60"
              />
            )}
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="Email"
              className="h-12 rounded-xl bg-secondary/60"
            />
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              className="h-12 rounded-xl bg-secondary/60"
            />

            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'login' ? 'Login' : 'Register'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl bg-secondary/40"
            onClick={handleGoogleClick}
            disabled={!googleClientId}
          >
            {googleClientId ? 'Continue with Google' : 'Google Sign-In is not configured'}
          </Button>
        </section>
      </div>
    </main>
  );
}
