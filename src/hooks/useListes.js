import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export function useListes(user) {
  const [listes, setListes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && isSupabaseConfigured) loadListes()
    else setLoading(false)
  }, [user])

  async function loadListes() {
    setLoading(true)

    // Mes listes
    const { data: mesListes } = await supabase
      .from('listes')
      .select('*, liste_items(count)')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('is_template', { ascending: false })
      .order('created_at', { ascending: false })

    // Listes partagées avec moi
    const { data: partages } = await supabase
      .from('liste_partages')
      .select('liste_id')

    let listesPartagees = []
    const sharedIds = (partages || []).map(p => p.liste_id)
    if (sharedIds.length > 0) {
      const { data } = await supabase
        .from('listes')
        .select('*, liste_items(count)')
        .in('id', sharedIds)
        .eq('archived', false)
      listesPartagees = (data || []).map(l => ({ ...l, is_shared: true }))
    }

    setListes([...(mesListes || []), ...listesPartagees])
    setLoading(false)
  }

  const creerListe = useCallback(async (nom, is_template = false, semaine_du = null) => {
    const { data } = await supabase
      .from('listes')
      .insert({ user_id: user.id, nom, is_template, semaine_du })
      .select()
      .single()
    if (data) setListes(prev => [data, ...prev])
    return data
  }, [user])

  const dupliquerListe = useCallback(async (listeSource, nomNouvelleListe) => {
    // Créer la nouvelle liste
    const lundi = getLundiSemaine()
    const { data: nouvelleListe } = await supabase
      .from('listes')
      .insert({
        user_id: user.id,
        nom: nomNouvelleListe,
        is_template: false,
        semaine_du: lundi,
      })
      .select()
      .single()

    if (!nouvelleListe) return null

    // Copier les items (non cochés seulement)
    const { data: items } = await supabase
      .from('liste_items')
      .select('produit_nom, produit_id, quantite')
      .eq('liste_id', listeSource.id)

    if (items && items.length > 0) {
      await supabase.from('liste_items').insert(
        items.map(item => ({
          liste_id: nouvelleListe.id,
          produit_nom: item.produit_nom,
          produit_id: item.produit_id,
          quantite: item.quantite,
          est_fait: false,
        }))
      )
    }

    setListes(prev => [nouvelleListe, ...prev])
    return nouvelleListe
  }, [user])

  const archiverListe = useCallback(async (listeId) => {
    await supabase.from('listes').update({ archived: true }).eq('id', listeId)
    setListes(prev => prev.filter(l => l.id !== listeId))
  }, [])

  const renommerListe = useCallback(async (listeId, nom) => {
    await supabase.from('listes').update({ nom }).eq('id', listeId)
    setListes(prev => prev.map(l => l.id === listeId ? { ...l, nom } : l))
  }, [])

  const toggleTemplate = useCallback(async (listeId, is_template) => {
    await supabase.from('listes').update({ is_template }).eq('id', listeId)
    setListes(prev => prev.map(l => l.id === listeId ? { ...l, is_template } : l))
  }, [])

  const partagerListe = useCallback(async (listeId, email) => {
    const { error } = await supabase
      .from('liste_partages')
      .insert({ liste_id: listeId, invited_email: email.trim().toLowerCase() })
    return !error
  }, [])

  return { listes, loading, creerListe, dupliquerListe, archiverListe, renommerListe, toggleTemplate, partagerListe, reload: loadListes }
}

function getLundiSemaine() {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const lundi = new Date(today.setDate(diff))
  return lundi.toISOString().split('T')[0]
}
