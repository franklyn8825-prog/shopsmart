import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, BarChart2, BookMarked } from 'lucide-react'

export default function BottomNav({ showListes, onListesClick }) {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    {
      label: 'Ma liste',
      icon: ShoppingCart,
      active: !showListes && location.pathname === '/',
      onClick: () => { if (showListes) onListesClick(); navigate('/') },
    },
    {
      label: 'Résultats',
      icon: BarChart2,
      active: !showListes && location.pathname === '/resultats',
      onClick: () => { if (showListes) onListesClick(); navigate('/resultats') },
    },
    {
      label: 'Mes listes',
      icon: BookMarked,
      active: showListes,
      onClick: onListesClick,
    },
  ]

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: '72px',
      backgroundColor: 'var(--color-card)', borderTop: '1px solid #e5e7eb',
      display: 'flex', alignItems: 'center', zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(({ label, icon: Icon, active, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '4px', padding: '8px', border: 'none', background: 'none',
            cursor: 'pointer',
            color: active ? 'var(--color-primary)' : 'var(--color-muted)',
            transition: 'color 0.15s',
          }}
        >
          <Icon size={22} strokeWidth={active ? 2.5 : 2} />
          <span style={{ fontSize: '11px', fontWeight: active ? '600' : '400' }}>
            {label}
          </span>
        </button>
      ))}
    </nav>
  )
}
