import { useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { mockProduits } from '../lib/mockData'

export function useProducts() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('produits')
        .select('id, nom, marque, categorie')
        .ilike('nom', `%${query}%`)
        .limit(6)

      if (!error && data) {
        setSuggestions(data)
      }
    } else {
      // Mode mock
      const q = query.toLowerCase()
      const results = mockProduits.filter(
        (p) =>
          p.nom.toLowerCase().includes(q) ||
          (p.marque && p.marque.toLowerCase().includes(q))
      )
      setSuggestions(results.slice(0, 6))
    }

    setLoading(false)
  }, [])

  const clearSuggestions = useCallback(() => setSuggestions([]), [])

  return { suggestions, loading, search, clearSuggestions }
}
