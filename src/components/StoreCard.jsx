import { MapPin, Flame, Trophy } from 'lucide-react'
import { getEnseigneStyle } from '../lib/mockData'

export default function StoreCard({ magasin, total, trouves, total_items, promos, isBest, onClick }) {
  const style = getEnseigneStyle(magasin.enseigne)
  const manquants = total_items - trouves

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--color-card)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: isBest
          ? '0 0 0 2px var(--color-primary), 0 4px 12px rgba(22,163,74,0.15)'
          : '0 1px 4px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Badge meilleur prix */}
      {isBest && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '16px',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          fontSize: '12px',
          fontWeight: '700',
          padding: '3px 10px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <Trophy size={12} />
          Meilleur prix
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Badge enseigne */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: style.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '22px' }}>{style.emoji}</span>
        </div>

        {/* Infos magasin */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--color-text)', marginBottom: '2px' }}>
            {magasin.nom}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MapPin size={12} />
              {magasin.distance < 1
                ? `${Math.round(magasin.distance * 1000)} m`
                : `${magasin.distance.toFixed(1)} km`}
            </span>
            {promos > 0 && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                color: 'var(--color-promo)',
                fontWeight: '600',
              }}>
                <Flame size={12} />
                {promos} promo{promos > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {manquants > 0 && (
            <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
              {trouves}/{total_items} produits trouvés
            </div>
          )}
        </div>

        {/* Prix total */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: isBest ? 'var(--color-primary)' : 'var(--color-text)',
          }}>
            {total.toFixed(2)} €
          </div>
          {manquants > 0 && (
            <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
              ~estimé
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
