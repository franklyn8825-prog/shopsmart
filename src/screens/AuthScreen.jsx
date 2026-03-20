import { useState } from 'react'
import { ShoppingCart, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

export default function AuthScreen() {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'magic'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'success'|'error', text }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (mode === 'magic') {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: `Un lien de connexion a été envoyé à ${email}` })
      }
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Compte créé ! Vérifiez votre email pour confirmer.' })
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage({ type: 'error', text: 'Email ou mot de passe incorrect.' })
      }
    }

    setLoading(false)
  }

  async function handleGoogleLogin() {
    setLoadingGoogle(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la connexion Google.' })
      setLoadingGoogle(false)
    }
    // Si succès, Supabase redirige automatiquement
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      backgroundColor: 'var(--color-bg)',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '72px', height: '72px',
          borderRadius: '20px',
          backgroundColor: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
        }}>
          <ShoppingCart size={36} color="white" />
        </div>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'var(--color-text)' }}>
          ShopSmart
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '15px', color: 'var(--color-muted)' }}>
          Comparez les prix de vos courses
        </p>
      </div>

      {/* Carte formulaire */}
      <div style={{
        width: '100%', maxWidth: '400px',
        backgroundColor: 'var(--color-card)',
        borderRadius: '20px',
        padding: '28px 24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        {/* Tabs mode */}
        <div style={{
          display: 'flex', gap: '4px',
          backgroundColor: '#f3f4f6', borderRadius: '12px',
          padding: '4px', marginBottom: '24px',
        }}>
          {[
            { key: 'login', label: 'Connexion' },
            { key: 'signup', label: 'Inscription' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setMode(key); setMessage(null) }}
              style={{
                flex: 1, padding: '9px',
                borderRadius: '9px', border: 'none',
                backgroundColor: mode === key ? 'white' : 'transparent',
                color: mode === key ? 'var(--color-text)' : 'var(--color-muted)',
                fontWeight: mode === key ? '600' : '400',
                fontSize: '14px', cursor: 'pointer',
                boxShadow: mode === key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Bouton Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
          style={{
            width: '100%', padding: '13px',
            borderRadius: '12px', border: '2px solid #e5e7eb',
            backgroundColor: 'white', color: 'var(--color-text)',
            fontSize: '15px', fontWeight: '600',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', cursor: loadingGoogle ? 'not-allowed' : 'pointer',
            marginBottom: '20px', transition: 'border-color 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          {loadingGoogle
            ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            : <GoogleIcon />
          }
          Continuer avec Google
        </button>

        {/* Séparateur */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px',
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
          <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>ou</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-text)', marginBottom: '6px' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                style={{
                  width: '100%', padding: '12px 14px 12px 40px',
                  fontSize: '15px', border: '2px solid #e5e7eb',
                  borderRadius: '10px', outline: 'none',
                  color: 'var(--color-text)', boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Mot de passe (pas en mode magic) */}
          {mode !== 'magic' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-text)', marginBottom: '6px' }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={mode === 'signup' ? 'Minimum 6 caractères' : '••••••••'}
                  minLength={6}
                  style={{
                    width: '100%', padding: '12px 42px 12px 40px',
                    fontSize: '15px', border: '2px solid #e5e7eb',
                    borderRadius: '10px', outline: 'none',
                    color: 'var(--color-text)', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)', border: 'none',
                    background: 'none', cursor: 'pointer',
                    color: 'var(--color-muted)', padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Message feedback */}
          {message && (
            <div style={{
              padding: '12px 14px', borderRadius: '10px',
              marginBottom: '16px', fontSize: '14px',
              backgroundColor: message.type === 'success' ? 'var(--color-primary-light)' : '#fef2f2',
              color: message.type === 'success' ? 'var(--color-primary)' : 'var(--color-promo)',
              fontWeight: '500',
            }}>
              {message.text}
            </div>
          )}

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              borderRadius: '12px', border: 'none',
              backgroundColor: 'var(--color-primary)', color: 'white',
              fontSize: '16px', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1,
              boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                {mode === 'login' ? 'Se connecter' : mode === 'signup' ? 'Créer mon compte' : 'Envoyer le lien'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Lien magic link */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => { setMode(mode === 'magic' ? 'login' : 'magic'); setMessage(null) }}
            style={{
              border: 'none', background: 'none',
              color: 'var(--color-primary)', fontSize: '14px',
              fontWeight: '500', cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            {mode === 'magic' ? '← Retour connexion par mot de passe' : 'Connexion par lien email (sans mot de passe)'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
