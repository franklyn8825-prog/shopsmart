import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ShoppingCart, ArrowRight, Loader2, Cloud, Trash2, FileText, ChevronDown } from 'lucide-react'
import ProductItem from '../components/ProductItem'
import ImportModal from '../components/ImportModal'
import { useProducts } from '../hooks/useProducts'
import { useList } from '../hooks/useList'
import { mockPrix } from '../lib/mockData'

function hasPromoDisponible(item) {
  if (!item.produit_id) return false
  const prixData = mockPrix[item.produit_id]
  if (!prixData) return false
  return Object.values(prixData).some((p) => p.promo !== null)
}

export default function HomeScreen({ user, listeCourante, onChangerListe }) {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const inputRef = useRef(null)
  const { suggestions, search, clearSuggestions } = useProducts()
  const { items, loading, syncing, addItem, toggleItem, deleteItem, updateQuantite, clearDone, importItems } = useList(user, listeCourante?.id)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.length >= 2) {
        search(input)
        setShowSuggestions(true)
      } else {
        clearSuggestions()
        setShowSuggestions(false)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [input, search, clearSuggestions])

  async function handleAdd(nom, produitRef = null) {
    if (!nom.trim()) return
    await addItem(nom, produitRef)
    setInput('')
    clearSuggestions()
    setShowSuggestions(false)
  }

  async function handleImport(parsedItems) {
    await importItems(parsedItems)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd(input)
    if (e.key === 'Escape') setShowSuggestions(false)
  }

  const itemsActifs = items.filter((i) => !i.est_fait)
  const itemsFaits = items.filter((i) => i.est_fait)

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '16px' }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 14px',
        backgroundColor: 'var(--color-card)',
        borderBottom: '1px solid #f3f4f6',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        {/* Titre + sync */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            backgroundColor: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ShoppingCart size={20} color="white" />
          </div>

          {/* Sélecteur de liste */}
          <button
            onClick={onChangerListe}
            style={{
              flex: 1, textAlign: 'left', border: 'none', background: 'none',
              cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text)', lineHeight: 1.2 }}>
                {listeCourante?.nom || 'Ma liste'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                {loading ? 'Chargement...' : `${itemsActifs.length} article${itemsActifs.length > 1 ? 's' : ''} à acheter`}
              </div>
            </div>
            <ChevronDown size={16} color="var(--color-muted)" style={{ marginTop: '2px' }} />
          </button>

          {/* Indicateur sync */}
          {syncing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-muted)' }}>
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}
          {!syncing && user && (
            <Cloud size={15} color="var(--color-primary)" />
          )}

          {/* Bouton import */}
          <button
            onClick={() => setShowImport(true)}
            title="Importer une liste"
            style={{
              width: '36px', height: '36px', borderRadius: '10px', border: 'none',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <FileText size={18} color="var(--color-primary)" />
          </button>
        </div>

        {/* Champ de saisie */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => input.length >= 2 && setShowSuggestions(true)}
              placeholder="Ajouter un produit..."
              disabled={loading}
              style={{
                flex: 1, padding: '12px 16px', fontSize: '16px',
                border: '2px solid #e5e7eb', borderRadius: '12px',
                outline: 'none', backgroundColor: loading ? '#f3f4f6' : '#f9fafb',
                color: 'var(--color-text)', transition: 'border-color 0.15s',
              }}
              onFocusCapture={(e) => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.backgroundColor = 'white' }}
              onBlurCapture={(e) => {
                e.target.style.borderColor = '#e5e7eb'
                e.target.style.backgroundColor = '#f9fafb'
                setTimeout(() => setShowSuggestions(false), 150)
              }}
            />
            <button
              onClick={() => handleAdd(input)}
              disabled={!input.trim() || loading}
              style={{
                width: '48px', height: '48px', borderRadius: '12px', border: 'none',
                backgroundColor: input.trim() ? 'var(--color-primary)' : '#e5e7eb',
                color: input.trim() ? 'white' : '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'not-allowed', flexShrink: 0,
              }}
            >
              <Plus size={22} />
            </button>
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              backgroundColor: 'white', borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              marginTop: '6px', zIndex: 100, overflow: 'hidden',
              border: '1px solid #f3f4f6',
            }}>
              {suggestions.map((produit) => (
                <button
                  key={produit.id}
                  onMouseDown={() => handleAdd(produit.nom, produit)}
                  style={{
                    width: '100%', padding: '12px 16px', border: 'none', background: 'none',
                    textAlign: 'left', cursor: 'pointer', borderBottom: '1px solid #f9fafb',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ fontWeight: '500', color: 'var(--color-text)', fontSize: '14px' }}>{produit.nom}</div>
                  {produit.marque && (
                    <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                      {produit.marque} · {produit.categorie}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Liste */}
      <div style={{ padding: '16px' }}>
        {loading && [1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: '56px', marginBottom: '8px', borderRadius: '12px' }} />
        ))}

        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-muted)' }}>
            <ShoppingCart size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>Liste vide</p>
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>
              Ajoute des produits ou importe une liste
            </p>
            <button
              onClick={() => setShowImport(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)',
                fontWeight: '600', fontSize: '14px', cursor: 'pointer',
              }}
            >
              <FileText size={16} /> Importer une liste
            </button>
          </div>
        )}

        {!loading && itemsActifs.map((item) => (
          <ProductItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} onUpdateQuantite={updateQuantite} hasPromo={hasPromoDisponible(item)} />
        ))}

        {!loading && itemsFaits.length > 0 && (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 4px', marginTop: '8px',
            }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Dans le panier ({itemsFaits.length})
              </span>
              <button
                onClick={clearDone}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-promo)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '500' }}
              >
                <Trash2 size={12} /> Effacer
              </button>
            </div>
            {itemsFaits.map((item) => (
              <ProductItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} onUpdateQuantite={updateQuantite} hasPromo={false} />
            ))}
          </>
        )}
      </div>

      {/* Bouton CTA */}
      <div style={{
        position: 'fixed', bottom: '72px', left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '480px', padding: '12px 16px',
        pointerEvents: items.length === 0 ? 'none' : 'auto',
      }}>
        <button
          onClick={() => navigate('/resultats', { state: { items } })}
          disabled={items.length === 0 || loading}
          style={{
            width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
            backgroundColor: items.length > 0 ? 'var(--color-primary)' : '#e5e7eb',
            color: items.length > 0 ? 'white' : '#9ca3af',
            fontSize: '16px', fontWeight: '700', cursor: items.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            boxShadow: items.length > 0 ? '0 4px 14px rgba(22,163,74,0.35)' : 'none',
          }}
        >
          Comparer les prix
          {items.length > 0 && (
            <span style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '20px', padding: '2px 10px', fontSize: '14px' }}>
              {items.length} article{items.length > 1 ? 's' : ''}
            </span>
          )}
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Modal import */}
      {showImport && (
        <ImportModal onImport={handleImport} onClose={() => setShowImport(false)} />
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
