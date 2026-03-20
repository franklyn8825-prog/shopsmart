import { useState } from 'react'
import { X, FileText, ArrowRight, Loader2 } from 'lucide-react'

function parseTexte(texte) {
  const lignes = texte.split('\n')
  const items = []

  for (let ligne of lignes) {
    // Nettoyer : enlever tirets, puces, numéros, astérisques
    let nom = ligne
      .replace(/^[-*•·✓✗✘▸▹►→\d]+[.):\s]+/, '') // tirets, puces, numéros
      .replace(/\*+/g, '')                          // astérisques markdown
      .trim()

    if (!nom || nom.length < 2) continue

    // Extraire la quantité si précisée (ex: "pâtes x3", "lait ×2", "3 yaourts")
    let quantite = 1
    const matchFin = nom.match(/[x×*]\s*(\d+)\s*$/i)
    const matchDebut = nom.match(/^(\d+)\s+(.+)/)

    if (matchFin) {
      quantite = parseInt(matchFin[1])
      nom = nom.replace(matchFin[0], '').trim()
    } else if (matchDebut && parseInt(matchDebut[1]) <= 20) {
      quantite = parseInt(matchDebut[1])
      nom = matchDebut[2].trim()
    }

    if (nom.length >= 2) {
      items.push({ nom, quantite })
    }
  }

  return items
}

export default function ImportModal({ onImport, onClose }) {
  const [texte, setTexte] = useState('')
  const [preview, setPreview] = useState([])
  const [loading, setLoading] = useState(false)
  const [etape, setEtape] = useState('saisie') // 'saisie' | 'preview'

  function handleAnalyse() {
    const parsed = parseTexte(texte)
    setPreview(parsed)
    setEtape('preview')
  }

  function removePreviewItem(index) {
    setPreview(prev => prev.filter((_, i) => i !== index))
  }

  async function handleImport() {
    setLoading(true)
    await onImport(preview)
    setLoading(false)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end',
    }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%', maxWidth: '480px', margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '20px 20px 0 0',
        padding: '24px 20px',
        maxHeight: '85dvh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            backgroundColor: 'var(--color-primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileText size={20} color="var(--color-primary)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '17px', color: 'var(--color-text)' }}>
              Importer une liste
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
              Colle n'importe quel format de texte
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={22} color="var(--color-muted)" />
          </button>
        </div>

        {etape === 'saisie' ? (
          <>
            <textarea
              autoFocus
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder={`Exemples acceptés :\n- Lait demi-écrémé\n- Pâtes x2\n• Yaourt nature\n3 pommes\nCafé moulu 250g`}
              style={{
                flex: 1, minHeight: '200px', padding: '14px',
                fontSize: '15px', lineHeight: '1.6',
                border: '2px solid #e5e7eb', borderRadius: '12px',
                outline: 'none', resize: 'none', color: 'var(--color-text)',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <button
              onClick={handleAnalyse}
              disabled={!texte.trim()}
              style={{
                marginTop: '14px', width: '100%', padding: '14px',
                borderRadius: '12px', border: 'none',
                backgroundColor: texte.trim() ? 'var(--color-primary)' : '#e5e7eb',
                color: texte.trim() ? 'white' : '#9ca3af',
                fontSize: '15px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', cursor: texte.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Analyser la liste <ArrowRight size={18} />
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '12px' }}>
              {preview.length} produit{preview.length > 1 ? 's' : ''} détecté{preview.length > 1 ? 's' : ''} — appuie sur ✕ pour en retirer
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '14px' }}>
              {preview.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-muted)' }}>
                  Aucun produit détecté. Retourne en arrière et modifie le texte.
                </div>
              )}
              {preview.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', backgroundColor: '#f9fafb',
                  borderRadius: '10px', marginBottom: '6px',
                }}>
                  <div style={{ flex: 1, fontSize: '14px', fontWeight: '500', color: 'var(--color-text)' }}>
                    {item.nom}
                  </div>
                  {item.quantite > 1 && (
                    <span style={{
                      fontSize: '12px', fontWeight: '600',
                      color: 'var(--color-primary)',
                      backgroundColor: 'var(--color-primary-light)',
                      padding: '2px 8px', borderRadius: '20px',
                    }}>
                      ×{item.quantite}
                    </span>
                  )}
                  <button
                    onClick={() => removePreviewItem(i)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#d1d5db', padding: '2px' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setEtape('saisie')}
                style={{
                  flex: 1, padding: '13px', borderRadius: '12px',
                  border: '2px solid #e5e7eb', backgroundColor: 'white',
                  color: 'var(--color-text)', fontWeight: '600',
                  fontSize: '14px', cursor: 'pointer',
                }}
              >
                Modifier
              </button>
              <button
                onClick={handleImport}
                disabled={preview.length === 0 || loading}
                style={{
                  flex: 2, padding: '13px', borderRadius: '12px',
                  border: 'none',
                  backgroundColor: preview.length > 0 ? 'var(--color-primary)' : '#e5e7eb',
                  color: preview.length > 0 ? 'white' : '#9ca3af',
                  fontWeight: '700', fontSize: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', cursor: preview.length > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                {loading
                  ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  : <>Ajouter {preview.length} produit{preview.length > 1 ? 's' : ''}</>
                }
              </button>
            </div>
          </>
        )}
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )
}
