import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, BookMarked, Archive, Copy, Pencil, Check, X,
  ShoppingCart, Star, StarOff, ChevronRight, User, LogOut
} from 'lucide-react'
import { useListes } from '../hooks/useListes'
import { supabase } from '../lib/supabase'

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function ListeItem({ liste, onSelect, onDupliquer, onArchiver, onRenommer, onToggleTemplate }) {
  const [editing, setEditing] = useState(false)
  const [nom, setNom] = useState(liste.nom)
  const [showActions, setShowActions] = useState(false)

  function handleRename() {
    if (nom.trim() && nom !== liste.nom) onRenommer(liste.id, nom.trim())
    setEditing(false)
  }

  const count = liste.liste_items?.[0]?.count || 0

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '14px',
      marginBottom: '10px',
      boxShadow: liste.is_template
        ? '0 0 0 2px #fbbf24, 0 2px 8px rgba(0,0,0,0.06)'
        : '0 1px 4px rgba(0,0,0,0.07)',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px' }}>
        {/* Icône */}
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
          backgroundColor: liste.is_template ? '#fef9c3' : 'var(--color-primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {liste.is_template
            ? <Star size={20} color="#d97706" />
            : <ShoppingCart size={20} color="var(--color-primary)" />
          }
        </div>

        {/* Nom */}
        <div style={{ flex: 1, minWidth: 0 }} onClick={() => !editing && onSelect(liste)}>
          {editing ? (
            <input
              autoFocus
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditing(false) }}
              onBlur={handleRename}
              style={{
                width: '100%', fontSize: '15px', fontWeight: '600',
                border: 'none', borderBottom: '2px solid var(--color-primary)',
                outline: 'none', padding: '2px 0', color: 'var(--color-text)',
              }}
            />
          ) : (
            <>
              <div style={{
                fontSize: '15px', fontWeight: '600', color: 'var(--color-text)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}>
                {liste.nom}
                {liste.is_template && (
                  <span style={{
                    marginLeft: '8px', fontSize: '11px', fontWeight: '700',
                    color: '#d97706', backgroundColor: '#fef9c3',
                    padding: '2px 7px', borderRadius: '20px',
                  }}>
                    MODÈLE
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                {count} article{count > 1 ? 's' : ''}
                {liste.semaine_du && ` · Semaine du ${formatDate(liste.semaine_du)}`}
              </div>
            </>
          )}
        </div>

        {/* Actions toggle */}
        <button
          onClick={() => setShowActions(!showActions)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-muted)' }}
        >
          <ChevronRight size={18} style={{ transform: showActions ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
      </div>

      {/* Actions expandables */}
      {showActions && (
        <div style={{
          borderTop: '1px solid #f3f4f6',
          display: 'flex', flexWrap: 'wrap', gap: '8px',
          padding: '12px 16px',
          backgroundColor: '#f9fafb',
        }}>
          <ActionBtn icon={ShoppingCart} label="Ouvrir" color="var(--color-primary)" onClick={() => onSelect(liste)} />
          <ActionBtn icon={Copy} label="Dupliquer" color="#6366f1" onClick={() => onDupliquer(liste)} />
          <ActionBtn icon={Pencil} label="Renommer" color="#f59e0b" onClick={() => { setEditing(true); setShowActions(false) }} />
          <ActionBtn
            icon={liste.is_template ? StarOff : Star}
            label={liste.is_template ? 'Retirer modèle' : 'Définir modèle'}
            color="#d97706"
            onClick={() => onToggleTemplate(liste.id, !liste.is_template)}
          />
          <ActionBtn icon={Archive} label="Archiver" color="var(--color-promo)" onClick={() => onArchiver(liste.id)} />
        </div>
      )}
    </div>
  )
}

function ActionBtn({ icon: Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '7px 12px', borderRadius: '20px',
        border: `1.5px solid ${color}20`,
        backgroundColor: `${color}10`,
        color, fontSize: '13px', fontWeight: '600',
        cursor: 'pointer',
      }}
    >
      <Icon size={14} />{label}
    </button>
  )
}

export default function ListesScreen({ user, onSelectListe }) {
  const navigate = useNavigate()
  const { listes, loading, creerListe, dupliquerListe, archiverListe, renommerListe, toggleTemplate } = useListes(user)
  const [showNouvelle, setShowNouvelle] = useState(false)
  const [nomNouvelle, setNomNouvelle] = useState('')

  const templates = listes.filter(l => l.is_template)
  const courantes = listes.filter(l => !l.is_template)

  async function handleCreer() {
    if (!nomNouvelle.trim()) return
    const liste = await creerListe(nomNouvelle.trim())
    setNomNouvelle('')
    setShowNouvelle(false)
    if (liste) onSelectListe(liste)
  }

  async function handleDupliquer(listeSource) {
    const lundi = new Date()
    const nomSemaine = `Semaine du ${lundi.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
    const nouvelleListe = await dupliquerListe(listeSource, nomSemaine)
    if (nouvelleListe) onSelectListe(nouvelleListe)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 0 24px' }}>
      {/* Header */}
      <div style={{
        padding: '20px 16px 16px',
        backgroundColor: 'var(--color-card)',
        borderBottom: '1px solid #f3f4f6',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--color-text)' }}>
            Mes listes
          </h1>
          <button
            onClick={() => setShowNouvelle(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '10px', border: 'none',
              backgroundColor: 'var(--color-primary)', color: 'white',
              fontWeight: '600', fontSize: '14px', cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Nouvelle
          </button>
        </div>
        {user && (
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-muted)' }}>
            {user.email}
          </p>
        )}
      </div>

      <div style={{ padding: '16px' }}>
        {/* Formulaire nouvelle liste */}
        {showNouvelle && (
          <div style={{
            backgroundColor: 'white', borderRadius: '14px', padding: '16px',
            marginBottom: '16px', boxShadow: '0 0 0 2px var(--color-primary)',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-muted)', marginBottom: '10px' }}>
              Nom de la nouvelle liste
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                autoFocus
                value={nomNouvelle}
                onChange={(e) => setNomNouvelle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreer(); if (e.key === 'Escape') setShowNouvelle(false) }}
                placeholder="Ex: Semaine du 24 mars..."
                style={{
                  flex: 1, padding: '10px 14px', fontSize: '15px',
                  border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none',
                  color: 'var(--color-text)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <button onClick={handleCreer} style={{ padding: '10px 14px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer' }}>
                <Check size={18} />
              </button>
              <button onClick={() => setShowNouvelle(false)} style={{ padding: '10px 14px', borderRadius: '10px', border: 'none', backgroundColor: '#f3f4f6', color: 'var(--color-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {loading && (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: '72px', marginBottom: '10px', borderRadius: '14px' }} />
            ))}
          </>
        )}

        {/* Modèles */}
        {!loading && templates.length > 0 && (
          <>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={13} /> Modèles ({templates.length})
            </div>
            {templates.map(liste => (
              <ListeItem
                key={liste.id}
                liste={liste}
                onSelect={onSelectListe}
                onDupliquer={handleDupliquer}
                onArchiver={archiverListe}
                onRenommer={renommerListe}
                onToggleTemplate={toggleTemplate}
              />
            ))}
            <div style={{ height: '8px' }} />
          </>
        )}

        {/* Listes courantes */}
        {!loading && courantes.length > 0 && (
          <>
            {templates.length > 0 && (
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Listes ({courantes.length})
              </div>
            )}
            {courantes.map(liste => (
              <ListeItem
                key={liste.id}
                liste={liste}
                onSelect={onSelectListe}
                onDupliquer={handleDupliquer}
                onArchiver={archiverListe}
                onRenommer={renommerListe}
                onToggleTemplate={toggleTemplate}
              />
            ))}
          </>
        )}

        {!loading && listes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-muted)' }}>
            <BookMarked size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontWeight: '500' }}>Aucune liste</p>
            <p style={{ fontSize: '14px' }}>Crée ta première liste ou commence par ajouter des produits</p>
          </div>
        )}

        {/* Profil / déconnexion */}
        {user && (
          <div style={{
            marginTop: '24px', borderTop: '1px solid #f3f4f6', paddingTop: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '700', color: 'white',
              }}>
                {user.email?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>Mon compte</div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px',
                border: '1.5px solid #fee2e2', backgroundColor: '#fef2f2',
                color: 'var(--color-promo)', fontWeight: '600', fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <LogOut size={14} /> Déconnexion
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
