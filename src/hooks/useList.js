import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const STORAGE_KEY = 'shopsmart_liste'

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export function useList(user, listeId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (user && isSupabaseConfigured && listeId) {
      loadFromSupabase(listeId)

      const channel = supabase
        .channel(`liste-${listeId}`)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'liste_items',
          filter: `liste_id=eq.${listeId}`,
        }, () => loadFromSupabase(listeId))
        .subscribe()

      return () => supabase.removeChannel(channel)
    } else if (!user) {
      loadFromLocalStorage()
    } else {
      setLoading(false)
    }
  }, [user, listeId])

  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, loading, user])

  function loadFromLocalStorage() {
    try {
      setItems(JSON.parse(localStorage.getItem(STORAGE_KEY)) || [])
    } catch { setItems([]) }
    setLoading(false)
  }

  async function loadFromSupabase(lid) {
    setLoading(true)
    const { data } = await supabase
      .from('liste_items')
      .select('*')
      .eq('liste_id', lid)
      .order('created_at', { ascending: false })

    setItems((data || []).map(item => ({
      id: item.id,
      produit_nom: item.produit_nom,
      produit_id: item.produit_id,
      quantite: item.quantite || 1,
      est_fait: item.est_fait || false,
    })))
    setLoading(false)
  }

  const addItem = useCallback(async (nom, produitRef = null) => {
    if (!nom.trim()) return
    const tempId = generateId()
    const newItem = { id: tempId, produit_nom: nom.trim(), produit_id: produitRef?.id || null, quantite: 1, est_fait: false }
    setItems(prev => [newItem, ...prev])

    if (user && isSupabaseConfigured && listeId) {
      setSyncing(true)
      const { data } = await supabase
        .from('liste_items')
        .insert({ liste_id: listeId, produit_nom: nom.trim(), produit_id: produitRef?.id || null, quantite: 1, est_fait: false })
        .select().single()
      if (data) setItems(prev => prev.map(i => i.id === tempId ? { ...i, id: data.id } : i))
      setSyncing(false)
    }
  }, [user, listeId])

  const importItems = useCallback(async (parsedItems) => {
    if (!parsedItems.length) return

    const newItems = parsedItems.map(p => ({
      id: generateId(), produit_nom: p.nom, produit_id: null, quantite: p.quantite || 1, est_fait: false,
    }))
    setItems(prev => [...newItems, ...prev])

    if (user && isSupabaseConfigured && listeId) {
      setSyncing(true)
      const { data } = await supabase
        .from('liste_items')
        .insert(parsedItems.map(p => ({
          liste_id: listeId, produit_nom: p.nom, produit_id: null, quantite: p.quantite || 1, est_fait: false,
        })))
        .select()

      if (data) {
        // Remplacer les items temporaires par les vrais IDs
        setItems(prev => {
          const tempIds = newItems.map(i => i.id)
          const sansTmp = prev.filter(i => !tempIds.includes(i.id))
          return [...data.map(d => ({ id: d.id, produit_nom: d.produit_nom, produit_id: d.produit_id, quantite: d.quantite, est_fait: d.est_fait })), ...sansTmp]
        })
      }
      setSyncing(false)
    }
  }, [user, listeId])

  const toggleItem = useCallback(async (id) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, est_fait: !i.est_fait } : i))
    if (user && isSupabaseConfigured) {
      await supabase.from('liste_items').update({ est_fait: !item.est_fait }).eq('id', id)
    }
  }, [user, items])

  const deleteItem = useCallback(async (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
    if (user && isSupabaseConfigured) {
      await supabase.from('liste_items').delete().eq('id', id)
    }
  }, [user])

  const updateQuantite = useCallback(async (id, quantite) => {
    if (quantite < 1) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantite } : i))
    if (user && isSupabaseConfigured) {
      await supabase.from('liste_items').update({ quantite }).eq('id', id)
    }
  }, [user])

  const clearDone = useCallback(async () => {
    const doneIds = items.filter(i => i.est_fait).map(i => i.id)
    setItems(prev => prev.filter(i => !i.est_fait))
    if (user && isSupabaseConfigured && doneIds.length > 0) {
      await supabase.from('liste_items').delete().in('id', doneIds)
    }
  }, [user, items])

  return { items, loading, syncing, addItem, importItems, toggleItem, deleteItem, updateQuantite, clearDone }
}
