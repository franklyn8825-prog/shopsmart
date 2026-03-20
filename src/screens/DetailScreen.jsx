import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Share2, Flame, ExternalLink, ShoppingBag } from 'lucide-react'
import { mockMagasins, mockProduits, mockPrix, getEnseigneStyle } from '../lib/mockData'

function calcReduction(normal, promo) {
  return Math.round((1 - promo / normal) * 100)
}

export default function DetailScreen() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { id } = useParams()

  const magasin = state?.magasin || mockMagasins.find((m) => m.id === id)
  const produitsListe = state?.produitsListe || []
  const enseigneStyle = getEnseigneStyle(magasin?.enseigne || '')

  if (!magasin) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-muted)' }}>
        <p>Magasin introuvable.</p>
        <button onClick={() => navigate('/')}>Retour à la liste</button>
      </div>
    )
  }

  // Calculer les données détaillées
  let totalNormal = 0
  let totalEffectif = 0
  let economiesPromo = 0

  const lignes = produitsListe.map((produit) => {
    const prix = mockPrix[produit.id]?.[magasin.id]
    const prixEffectif = prix ? (prix.promo ?? prix.normal) : null
    if (prix) {
      totalNormal += prix.normal * (produit.quantite || 1)
      totalEffectif += prixEffectif * (produit.quantite || 1)
      if (prix.promo) {
        economiesPromo += (prix.normal - prix.promo) * (produit.quantite || 1)
      }
    }
    return { produit, prix, prixEffectif }
  })

  function handleShare() {
    const texte = `Ma liste de courses chez ${magasin.nom} : ${totalEffectif.toFixed(2)} € — ShopSmart`
    if (navigator.share) {
      navigator.share({ title: 'ShopSmart', text: texte, url: window.location.href })
    } else {
      navigator.clipboard.writeText(texte)
      alert('Lien copié !')
    }
  }

  function handleGoogleMaps() {
    const query = encodeURIComponent(`${magasin.nom} ${magasin.adresse || magasin.enseigne}`)
    window.open(`https://maps.google.com/?q=${query}`, '_blank')
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      {/* Header enseigne */}
      <div style={{
        backgroundColor: enseigneStyle.bg,
        padding: '20px 16px 24px',
        position: 'relative',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            border: 'none', backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', marginBottom: '12px',
          }}
        >
          <ArrowLeft size={18} color="white" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '36px' }}>{enseigneStyle.emoji}</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'white' }}>
              {magasin.nom}
            </h1>
            {magasin.adresse && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <MapPin size={13} color="rgba(255,255,255,0.8)" />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                  {magasin.adresse}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Total résumé */}
      <div style={{
        margin: '0 16px',
        marginTop: '-16px',
        backgroundColor: 'var(--color-card)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '2px' }}>
            Total estimé
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-primary)' }}>
            {totalEffectif.toFixed(2)} €
          </div>
          {economiesPromo > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Flame size={13} color="var(--color-promo)" />
              <span style={{ fontSize: '13px', color: 'var(--color-promo)', fontWeight: '600' }}>
                Économie de {economiesPromo.toFixed(2)} € avec les promos
              </span>
            </div>
          )}
        </div>
        <ShoppingBag size={40} color="var(--color-primary)" style={{ opacity: 0.15 }} />
      </div>

      {/* Liste détaillée produits */}
      <div style={{ padding: '16px' }}>
        <div style={{
          fontSize: '12px', fontWeight: '600',
          color: 'var(--color-muted)', textTransform: 'uppercase',
          letterSpacing: '0.05em', marginBottom: '12px', paddingLeft: '4px',
        }}>
          Détail par produit ({lignes.length})
        </div>

        {lignes.map(({ produit, prix, prixEffectif }) => (
          <div
            key={produit.id}
            style={{
              backgroundColor: 'var(--color-card)',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            {/* Nom */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '14px', fontWeight: '500',
                color: 'var(--color-text)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {produit.nom}
              </div>
              {produit.marque && (
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                  {produit.marque}
                </div>
              )}
            </div>

            {/* Badge promo */}
            {prix?.promo && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                backgroundColor: '#fef2f2', color: 'var(--color-promo)',
                fontSize: '11px', fontWeight: '700',
                padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap',
              }}>
                <Flame size={11} />
                -{calcReduction(prix.normal, prix.promo)}%
              </div>
            )}

            {/* Prix */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              {prix ? (
                <>
                  <div style={{
                    fontSize: '16px', fontWeight: '700',
                    color: prix.promo ? 'var(--color-promo)' : 'var(--color-text)',
                  }}>
                    {prixEffectif.toFixed(2)} €
                  </div>
                  {prix.promo && (
                    <div style={{
                      fontSize: '12px', color: 'var(--color-muted)',
                      textDecoration: 'line-through',
                    }}>
                      {prix.normal.toFixed(2)} €
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--color-muted)', fontStyle: 'italic' }}>
                  Prix inconnu
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Résumé économies */}
        {economiesPromo > 0 && (
          <div style={{
            backgroundColor: 'var(--color-primary-light)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginTop: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--color-primary)', fontWeight: '600' }}>
              Prix sans promos
            </span>
            <span style={{ fontSize: '16px', color: 'var(--color-muted)', textDecoration: 'line-through' }}>
              {totalNormal.toFixed(2)} €
            </span>
          </div>
        )}
      </div>

      {/* Boutons action */}
      <div style={{ padding: '0 16px 24px', display: 'flex', gap: '10px' }}>
        <button
          onClick={handleGoogleMaps}
          style={{
            flex: 1, padding: '14px',
            borderRadius: '12px', border: 'none',
            backgroundColor: '#f3f4f6', color: 'var(--color-text)',
            fontWeight: '600', fontSize: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', cursor: 'pointer',
          }}
        >
          <ExternalLink size={16} />
          Google Maps
        </button>
        <button
          onClick={handleShare}
          style={{
            flex: 1, padding: '14px',
            borderRadius: '12px', border: 'none',
            backgroundColor: 'var(--color-primary)', color: 'white',
            fontWeight: '600', fontSize: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', cursor: 'pointer',
          }}
        >
          <Share2 size={16} />
          Partager
        </button>
      </div>
    </div>
  )
}
