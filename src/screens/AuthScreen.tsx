import { useState } from 'react';
import { T, Button } from '../components';
import { login, register, saveToken } from '../api/auth';

interface Props {
  onAuth: (token: string) => void;
  isFirstRun?: boolean;
}

export function AuthScreen({ onAuth, isFirstRun = false }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>(isFirstRun ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    fontFamily: T.sans, fontSize: 16, color: T.ink,
    background: T.card, border: `1.5px solid ${T.stone200}`,
    borderRadius: 14, padding: '13px 14px', outline: 'none',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = mode === 'login' ? login : register;
      const res = await fn(email, password);
      saveToken(res.access_token);
      onAuth(res.access_token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: T.paper, padding: '0 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <img src="/rootly-mark.svg" alt="Rootly" style={{ width: 48, height: 48, marginBottom: 12 }} />
          <div style={{ fontFamily: T.display, fontWeight: 800, fontSize: 28, color: T.ink }}>Rootly</div>
          {isFirstRun ? (
            <>
              <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 600, color: T.fern, marginTop: 6 }}>
                First run — set up your admin account
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 13, color: T.ink3, marginTop: 4, textAlign: 'center' }}>
                The first account created becomes the admin.
              </div>
            </>
          ) : (
            <div style={{ fontFamily: T.sans, fontSize: 14, color: T.ink3, marginTop: 4 }}>
              Grow from the root up.
            </div>
          )}
        </div>

        {/* Mode toggle — hidden on first run since there's nobody to log in yet */}
        {!isFirstRun && (
          <div style={{
            display: 'flex', background: T.linen, borderRadius: 12,
            padding: 4, marginBottom: 28, gap: 4,
          }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, fontFamily: T.sans, fontWeight: 600, fontSize: 14,
                  padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: mode === m ? T.card : 'transparent',
                  color: mode === m ? T.ink : T.ink3,
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                  transition: 'all .15s ease',
                }}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.ink2, display: 'block', marginBottom: 7 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = T.fern)}
              onBlur={e => (e.target.style.borderColor = T.stone200)}
            />
          </div>
          <div>
            <label style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.ink2, display: 'block', marginBottom: 7 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Create a password' : 'Your password'}
              required
              minLength={8}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = T.fern)}
              onBlur={e => (e.target.style.borderColor = T.stone200)}
            />
          </div>

          {error && (
            <div style={{
              fontFamily: T.sans, fontSize: 13.5, color: '#c0392b',
              background: '#fdf0ee', borderRadius: 10, padding: '10px 14px',
            }}>
              {error}
            </div>
          )}

          <Button type="submit" full style={{ marginTop: 4 }} disabled={loading}>
            {loading ? '…' : isFirstRun ? 'Set up Rootly' : mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
