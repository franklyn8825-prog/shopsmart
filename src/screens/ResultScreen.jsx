import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Navigation, Search, ArrowLeft, SlidersHorizontal } from 'lucide-react'
import StoreCard from '../components/StoreCard'
import { useLocation as useGeoLocation } from '../hooks/useLocation'
import { mockMagasins, mockProduits, mockPrix, calculerTotal } from '../lib/mockData'

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

export default function ResultScreen() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { location, error: geoError, loading: geoLoading, requestLocation } = useGeoLocation()
  const [adresseManuelle, setAdresseManuelle] = useState('')
  const [rayon, setRayon] = useState(5)
  const [showRayonPicker, setShowRayonPicker] = useState(false)
  const [loading, setLoading] = useState(true)
  const [resultats, setResultats] = useState([])

  const items = state?.items || []

  // Résoudre les produits dans la liste
  const produitsListe = items.map((item) => {
    const produitRef = mockProduits.find((p) => p.id === item.produit_id) ||
      mockProduits.find((p) => p.nom.toLowerCase().includes(item.produit_nom.toLowerCase()))
    return produitRef ? { ...produitRef, quantite: item.quantite } : null
  }).filter(Boolean)

  useEffect(() => {
    // Simuler un délai de chargement pour l'effet skeleton
    const timer = setTimeout(() => {
      const res = mockMagasins.map((magasin) => {
        const { total, trouves, promos, manquants } = calculerTotal(produitsListe, magasin.id)
        return { magasin, total, trouves, promos, manquants }
      })
      res.sort((a, b) => a.total - b.total)
      setResultats(res)
      setLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    requestLocation()
  }, [])

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--color-card)',
        borderBottom: '1px solid #f3f4f6',
        position: 'sticky',
        top: 0,
        zIndex: 10,
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
              Comparatif magasins
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

        {/* Sélecteur de rayon */}
        {showRayonPicker && (
          <div style={{
            display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap',
          }}>
            {[1, 2, 5, 10, 20].map((r) => (
              <button
                key={r}
                onClick={() => { setRayon(r); setShowRayonPicker(false) }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: `2px solid ${rayon === r ? 'var(--color-primary)' : '#e5e7eb'}`,
                  backgroundColor: rayon === r ? 'var(--color-primary-light)' : 'white',
                  color: rayon === r ? 'var(--color-primary)' : 'var(--color-muted)',
                  fontWeight: rayon === r ? '700' : '400',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {r} km
              </button>
            ))}
          </div>
        )}

        {/* Statut géolocalisation */}
        {geoError ? (
          <div style={{ backgroundColor: '#fef2f2', borderRadius: '10px', padding: '10px 12px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--color-promo)', fontWeight: '500' }}>
              {geoError}
            </p>
            <input
              type="text"
              value={adresseManuelle}
              onChange={(e) => setAdresseManuelle(e.target.value)}
              placeholder="Entrez votre adresse manuellement..."
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                outline: 'none',
                color: 'var(--color-text)',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '13px',
            color: geoLoading ? 'var(--color-muted)' : 'var(--color-primary)',
          }}>
            {geoLoading ? (
              <>
                <Navigation size={14} />
                Localisation en cours...
              </>
            ) : location ? (
              <>
                <MapPin size={14} />
                Position détectée · Résultats dans un rayon de {rayon} km
              </>
            ) : (
              <button
                onClick={requestLocation}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '8px',
                  backgroundColor: 'var(--color-primary-light)',
                  border: 'none', cursor: 'pointer',
                  color: 'var(--color-primary)', fontWeight: '600',
                  fontSize: '13px',
                }}
              >
                <Navigation size={14} />
                Activer la localisation
              </button>
            )}
          </div>
        )}
      </div>

      {/* Résultats */}
      <div style={{ padding: '16px' }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-muted)' }}>
            <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontWeight: '500' }}>Votre liste est vide</p>
            <button
              onClick={() => navigate('/')}
              style={{
                marginTop: '16px', padding: '10px 20px',
                borderRadius: '10px', border: 'none',
                backgroundColor: 'var(--color-primary)', color: 'white',
                fontWeight: '600', cursor: 'pointer', fontSize: '14px',
              }}
            >
              Retour à la liste
            </button>
          </div>
        )}

        {loading && items.length > 0 && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!loading && resultats.map(({ magasin, total, trouves, promos }, index) => (
          <StoreCard
            key={magasin.id}
            magasin={magasin}
            total={total}
            trouves={trouves}
            total_items={produitsListe.length}
            promos={promos}
            isBest={index === 0}
            onClick={() => navigate(`/detail/${magasin.id}`, {
              state: { magasin, items, produitsListe }
            })}
          />
        ))}

        {!loading && resultats.length > 0 && (
          <p style={{
            textAlign: 'center', fontSize: '12px',
            color: 'var(--color-muted)', marginTop: '16px',
          }}>
            Les prix sont indicatifs et peuvent varier. Données mises à jour régulièrement.
          </p>
        )}
      </div>
    </div>
  )
}
