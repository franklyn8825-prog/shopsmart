import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Navigation, ArrowLeft, SlidersHorizontal, Search, Tag, ShoppingCart, TrendingDown } from 'lucide-react'
import { useLocation as useGeoLocation } from '../hooks/useLocation'
import { usePromos } from '../hooks/usePromos'
import { getEnseigneStyle } from '../lib/mockData'

function SkeletonCard() {
  return (
    <div style={{
      backgroundColor: 'var(--color-card)',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '12px',
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    }}>
      <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: '18px', width: '60%', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '14px', width: '40%' }} />
      </div>
      <div className="skeleton" style={{ height: '32px', width: '70px', borderRadius: '8px' }} />
    </div>
  )
}

function EnseigneCard({ data, isBest, onClick }) {
  const { enseigne, total, trouves, total_items, promos } = data
  const style = getEnseigneStyle(enseigne)
  const manquants = total_items - trouves
  const nbPromos = promos.filter(p => p.reduction_pct > 0).length

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--color-card)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        border: isBest ? '2px solid var(--color-primary)' : '2px solid transparent',
        position: 'relative',
      }}
    >
      {isBest && trouves > 0 && (
        <div style={{
          position: 'absolute', top: '-10px', left: '16px',
          backgroundColor: 'var(--color-primary)',
          color: 'white', fontSize: '11px', fontWeight: '700',
          padding: '2px 10px', borderRadius: '20px',
        }}>
          Meilleure option
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Logo enseigne */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          backgroundColor: style.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: '20px',
        }}>
          {style.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--color-text)' }}>
            {enseigne}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '2px' }}>
            {trouves > 0
              ? `${trouves}/${total_items} article${trouves > 1 ? 's' : ''} trouvé${trouves > 1 ? 's' : ''} en promo`
              : 'Aucun article en promo cette semaine'}
          </div>
        </div>

        {/* Total */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {trouves > 0 ? (
            <>
              <div style={{ fontWeight: '800', fontSize: '20px', color: 'var(--color-primary)' }}>
                {total.toFixed(2)}€
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                articles en promo
              </div>
            </>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>—</div>
          )}
        </div>
      </div>

      {/* Badges résumé */}
      {trouves > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          {nbPromos > 0 && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              backgroundColor: '#fef2f2', color: 'var(--color-promo)',
              borderRadius: '20px', padding: '4px 10px',
              fontSize: '12px', fontWeight: '600',
            }}>
              <Tag size={12} />
              {nbPromos} promo{nbPromos > 1 ? 's' : ''}
            </span>
          )}
          {manquants > 0 && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              backgroundColor: '#f3f4f6', color: 'var(--color-muted)',
              borderRadius: '20px', padding: '4px 10px',
              fontSize: '12px',
            }}>
              {manquants} non trouvé{manquants > 1 ? 's' : ''}
            </span>
          )}
          {promos[0]?.valable_au && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              backgroundColor: '#f0fdf4', color: '#16a34a',
              borderRadius: '20px', padding: '4px 10px',
              fontSize: '12px',
            }}>
              Jusqu'au {new Date(promos[0].valable_au).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      )}

      {/* Aperçu des 3 premiers produits trouvés */}
      {promos.length > 0 && (
        <div style={{ marginTop: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
          {promos.slice(0, 3).map((promo, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: i < 2 ? '6px' : 0,
            }}>
              {promo.image_url && (
                <img
                  src={promo.image_url}
                  alt={promo.produit_nom}
                  style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '6px', flexShrink: 0 }}
                  onError={e => { e.target.style.display = 'none' }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text)', fontWeight: '500',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {promo._item} → {promo.produit_nom}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontWeight: '700', color: 'var(--color-promo)', fontSize: '13px' }}>
                  {promo.prix_promo.toFixed(2)}€
                </span>
                {promo.prix_normal > promo.prix_promo && (
                  <span style={{ fontSize: '11px', color: 'var(--color-muted)',
                    textDecoration: 'line-through', marginLeft: '4px' }}>
                    {promo.prix_normal.toFixed(2)}€
                  </span>
                )}
                {promo.reduction_pct > 0 && (
                  <div style={{ fontSize: '11px', color: 'var(--color-promo)', fontWeight: '600' }}>
                    -{promo.reduction_pct}%
                  </div>
                )}
              </div>
            </div>
          ))}
          {promos.length > 3 && (
            <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '6px', textAlign: 'center' }}>
              +{promos.length - 3} autre{promos.length - 3 > 1 ? 's' : ''} produit{promos.length - 3 > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ResultScreen() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { location, error: geoError, loading: geoLoading, requestLocation } = useGeoLocation()
  const [rayon, setRayon] = useState(5)
  const [showRayonPicker, setShowRayonPicker] = useState(false)
  const { resultats, loading, chercher } = usePromos()

  const items = state?.items || []

  useEffect(() => {
    chercher(items)
    requestLocation()
  }, [])

  const hasResults = resultats.some(r => r.trouves > 0)

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--color-card)',
        borderBottom: '1px solid #f3f4f6',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              border: 'none', backgroundColor: '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} color="var(--color-text)" />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--color-text)' }}>
              Promos de la semaine
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-muted)' }}>
              {items.length} article{items.length > 1 ? 's' : ''} · Rayon {rayon} km
            </p>
          </div>
          <button
            onClick={() => setShowRayonPicker(!showRayonPicker)}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              border: 'none', backgroundColor: '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <SlidersHorizontal size={18} color="var(--color-text)" />
          </button>
        </div>

        {showRayonPicker && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {[1, 2, 5, 10, 20].map((r) => (
              <button key={r} onClick={() => { setRayon(r); setShowRayonPicker(false) }} style={{
                padding: '6px 14px', borderRadius: '20px',
                border: `2px solid ${rayon === r ? 'var(--color-primary)' : '#e5e7eb'}`,
                backgroundColor: rayon === r ? 'var(--color-primary-light)' : 'white',
                color: rayon === r ? 'var(--color-primary)' : 'var(--color-muted)',
                fontWeight: rayon === r ? '700' : '400', fontSize: '14px', cursor: 'pointer',
              }}>
                {r} km
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
          color: geoLoading ? 'var(--color-muted)' : 'var(--color-primary)' }}>
          {geoLoading ? (
            <><Navigation size={14} /> Localisation en cours...</>
          ) : location ? (
            <><MapPin size={14} /> Position détectée · Rayon {rayon} km</>
          ) : geoError ? (
            <span style={{ color: 'var(--color-muted)' }}><MapPin size={14} /> {geoError}</span>
          ) : (
            <button onClick={requestLocation} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light)',
              border: 'none', cursor: 'pointer',
              color: 'var(--color-primary)', fontWeight: '600', fontSize: '13px',
            }}>
              <Navigation size={14} /> Activer la localisation
            </button>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: '16px' }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-muted)' }}>
            <ShoppingCart size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontWeight: '500' }}>Votre liste est vide</p>
            <button onClick={() => navigate('/')} style={{
              marginTop: '16px', padding: '10px 20px',
              borderRadius: '10px', border: 'none',
              backgroundColor: 'var(--color-primary)', color: 'white',
              fontWeight: '600', cursor: 'pointer', fontSize: '14px',
            }}>
              Retour à la liste
            </button>
          </div>
        )}

        {loading && items.length > 0 && (
          <><SkeletonCard /><SkeletonCard /></>
        )}

        {!loading && resultats.map((data, index) => (
          <EnseigneCard
            key={data.enseigne}
            data={data}
            isBest={index === 0 && hasResults}
            onClick={() => navigate(`/detail/${data.enseigne}`, {
              state: { enseigne: data, items }
            })}
          />
        ))}

        {!loading && !hasResults && items.length > 0 && (
          <div style={{
            textAlign: 'center', padding: '40px 24px',
            backgroundColor: 'var(--color-card)', borderRadius: '16px',
          }}>
            <TrendingDown size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontWeight: '600', color: 'var(--color-text)', marginBottom: '8px' }}>
              Aucune promo cette semaine
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
              Aucun article de votre liste n'est en promotion chez Carrefour ou Leclerc cette semaine.
            </p>
          </div>
        )}

        {!loading && hasResults && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-muted)', marginTop: '8px' }}>
            Données scrapers mises à jour régulièrement · Prix indicatifs
          </p>
        )}
      </div>
    </div>
  )
}
