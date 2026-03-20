import { Trash2, Flame, Minus, Plus } from 'lucide-react'

export default function ProductItem({ item, onToggle, onDelete, onUpdateQuantite, hasPromo }) {
  return (
    <div
      className="animate-slide-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        backgroundColor: 'var(--color-card)',
        borderRadius: '12px',
        marginBottom: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        opacity: item.est_fait ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(item.id)}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: `2px solid ${item.est_fait ? 'var(--color-primary)' : '#d1d5db'}`,
          backgroundColor: item.est_fait ? 'var(--color-primary)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.15s',
        }}
      >
        {item.est_fait && (
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
            <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Nom produit */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontSize: '15px',
          fontWeight: '500',
          color: 'var(--color-text)',
          textDecoration: item.est_fait ? 'line-through' : 'none',
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {item.produit_nom}
        </span>
      </div>

      {/* Quantité +/- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <button
          onClick={() => onUpdateQuantite(item.id, item.quantite - 1)}
          style={{
            width: '26px', height: '26px', borderRadius: '8px', border: '1.5px solid #e5e7eb',
            background: 'none', cursor: item.quantite <= 1 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: item.quantite <= 1 ? '#d1d5db' : 'var(--color-text)',
          }}
          disabled={item.quantite <= 1}
        >
          <Minus size={12} />
        </button>
        <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '18px', textAlign: 'center', color: 'var(--color-text)' }}>
          {item.quantite}
        </span>
        <button
          onClick={() => onUpdateQuantite(item.id, item.quantite + 1)}
          style={{
            width: '26px', height: '26px', borderRadius: '8px', border: '1.5px solid #e5e7eb',
            background: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-text)',
          }}
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Badge promo */}
      {hasPromo && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          backgroundColor: '#fef2f2',
          color: 'var(--color-promo)',
          fontSize: '11px',
          fontWeight: '600',
          padding: '3px 7px',
          borderRadius: '20px',
          whiteSpace: 'nowrap',
        }}>
          <Flame size={11} />
          Promo
        </div>
      )}

      {/* Bouton supprimer */}
      <button
        onClick={() => onDelete(item.id)}
        style={{
          padding: '6px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          color: '#d1d5db',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-promo)'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}
