import { useState, useEffect } from 'react'
import { User, Mail, LogOut, ShoppingBag, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ProfilScreen({ user }) {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ listes: 0, articles: 0 })

  useEffect(() => {
    async function loadStats() {
      if (!user) return
      const { data: listes } = await supabase
        .from('listes')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)

      const { count: articles } = await supabase
        .from('liste_items')
        .select('*', { count: 'exact', head: true })

      setStats({ listes: listes?.length || 0, articles: articles || 0 })
    }
    loadStats()
  }, [user])

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
  }

  if (!user) return null

  const initiales = user.email?.slice(0, 2).toUpperCase() || '??'

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Avatar */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
          fontSize: '28px', fontWeight: '700', color: 'white',
        }}>
          {initiales}
        </div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>
          Mon compte
        </div>
        <div style={{ fontSize: '14px', color: 'var(--color-muted)', marginTop: '4px' }}>
          {user.email}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '12px', marginBottom: '24px',
      }}>
        {[
          { icon: ShoppingBag, label: 'Listes créées', value: stats.listes },
          { icon: User, label: 'Articles ajoutés', value: stats.articles },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{
            backgroundColor: 'var(--color-card)',
            borderRadius: '14px', padding: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            textAlign: 'center',
          }}>
            <Icon size={22} color="var(--color-primary)" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-text)' }}>
              {value}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Infos compte */}
      <div style={{
        backgroundColor: 'var(--color-card)', borderRadius: '14px',
        overflow: 'hidden', marginBottom: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          padding: '14px 16px', display: 'flex',
          alignItems: 'center', gap: '12px',
          borderBottom: '1px solid #f3f4f6',
        }}>
          <Mail size={18} color="var(--color-muted)" />
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Adresse email</div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' }}>
              {user.email}
            </div>
          </div>
        </div>
        <div style={{
          padding: '14px 16px', display: 'flex',
          alignItems: 'center', gap: '12px',
        }}>
          <User size={18} color="var(--color-muted)" />
          <div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Membre depuis</div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' }}>
              {new Date(user.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Bouton déconnexion */}
      <button
        onClick={handleLogout}
        disabled={loading}
        style={{
          width: '100%', padding: '14px',
          borderRadius: '12px', border: '2px solid #fee2e2',
          backgroundColor: '#fef2f2', color: 'var(--color-promo)',
          fontSize: '15px', fontWeight: '600',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', cursor: 'pointer',
        }}
      >
        {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <LogOut size={18} />}
        Se déconnecter
      </button>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
