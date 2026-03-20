import { useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const ENSEIGNES = ['Carrefour', 'Leclerc']

// Mots à ignorer pour la recherche
const STOPWORDS = new Set([
  'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'en',
  'au', 'aux', 'à', "l'", "d'", 'par', 'sur', 'avec', 'pour',
])

function getSearchTerms(nom) {
  const mots = nom.toLowerCase().trim().split(/\s+/)
  const meaningful = mots.filter(m => m.length >= 3 && !STOPWORDS.has(m))
  if (meaningful.length === 0) return [nom.trim()]
  const terms = []
  if (meaningful.length >= 2) terms.push(meaningful.slice(0, 2).join(' '))
  terms.push(meaningful[0])
  return terms
}

// Distance en km entre deux coordonnées GPS (formule Haversine)
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function getEnseignesProches(userLat, userLng, rayonKm) {
  if (!userLat || !userLng) return null  // null = pas de filtre

  const { data } = await supabase
    .from('magasins')
    .select('enseigne, nom, adresse, ville, lat, lng')
    .in('enseigne', ENSEIGNES)

  if (!data || data.length === 0) return null

  // Trouver le magasin le plus proche par enseigne
  const result = {}
  for (const enseigne of ENSEIGNES) {
    const stores = data.filter(m => m.enseigne === enseigne)
    let closest = null
    let minDist = Infinity
    for (const s of stores) {
      const d = distanceKm(userLat, userLng, s.lat, s.lng)
      if (d < minDist) {
        minDist = d
        closest = { ...s, distance: Math.round(d * 10) / 10 }
      }
    }
    if (closest) result[enseigne] = closest
  }

  return result
}

async function searchPromos(searchTerm) {
  // Regex avec limites de mots : "vin" ne matche pas "viande"
  const { data } = await supabase
    .from('promos')
    .select('enseigne, produit_nom, ean, prix_promo, prix_normal, reduction_pct, image_url, valable_du, valable_au')
    .filter('produit_nom', '~*', `\\b${searchTerm}\\b`)
    .in('enseigne', ENSEIGNES)
    .order('reduction_pct', { ascending: false })
    .limit(10)

  return data || []
}

export function usePromos() {
  const [resultats, setResultats] = useState([])
  const [loading, setLoading] = useState(false)

  const chercher = useCallback(async (items, userLocation, rayonKm = 10) => {
    if (!items?.length) return
    setLoading(true)

    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    // Trouver les magasins proches (si localisation disponible)
    const magasinsProches = await getEnseignesProches(
      userLocation?.lat,
      userLocation?.lng,
      rayonKm
    )

    // Filtrer les enseignes selon le rayon si on a la localisation
    const enseignesFiltrees = magasinsProches
      ? ENSEIGNES.filter(e => {
          const m = magasinsProches[e]
          return m && m.distance <= rayonKm
        })
      : ENSEIGNES

    // Initialiser le résultat par enseigne
    const map = {}
    ENSEIGNES.forEach(e => {
      const magasin = magasinsProches?.[e] || null
      map[e] = {
        enseigne: e,
        promos: [],
        total: 0,
        trouves: 0,
        total_items: items.length,
        magasin,  // infos du magasin le plus proche
        horsRayon: magasinsProches ? !enseignesFiltrees.includes(e) : false,
      }
    })

    // Pour chaque article, chercher les promos
    for (const item of items) {
      const nom = item.produit_nom || ''
      if (!nom.trim()) continue

      const terms = getSearchTerms(nom)
      let allData = []

      for (const term of terms) {
        const data = await searchPromos(term)
        if (data.length > 0) {
          allData = data
          break
        }
      }

      if (allData.length === 0) continue

      for (const enseigne of enseignesFiltrees) {
        const dejaTrouve = map[enseigne].promos.find(p => p._item === nom)
        if (dejaTrouve) continue

        const match = allData.find(d => d.enseigne === enseigne)
        if (match) {
          map[enseigne].promos.push({ ...match, _item: nom, quantite: item.quantite || 1 })
          map[enseigne].total += match.prix_promo * (item.quantite || 1)
          map[enseigne].trouves++
        }
      }
    }

    // Trier : hors rayon en dernier, puis plus d'articles trouvés, puis total le plus bas
    const sorted = Object.values(map).sort((a, b) => {
      if (a.horsRayon !== b.horsRayon) return a.horsRayon ? 1 : -1
      return b.trouves - a.trouves || a.total - b.total
    })
    setResultats(sorted)
    setLoading(false)
  }, [])

  return { resultats, loading, chercher }
}
