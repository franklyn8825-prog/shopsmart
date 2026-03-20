import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import ResultScreen from './screens/ResultScreen'
import DetailScreen from './screens/DetailScreen'
import AuthScreen from './screens/AuthScreen'
import ListesScreen from './screens/ListesScreen'
import BottomNav from './components/BottomNav'
import { supabase, isSupabaseConfigured } from './lib/supabase'

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px',
        backgroundColor: 'var(--color-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse 1.2s ease-in-out infinite',
      }}>
        <span style={{ fontSize: '24px' }}>🛒</span>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.92)}}`}</style>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [listeCourante, setListeCourante] = useState(null)
  const [showListes, setShowListes] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) { setListeCourante(null); setShowListes(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Créer/charger la liste par défaut quand l'user se connecte
  useEffect(() => {
    if (user && isSupabaseConfigured && !listeCourante) {
      initListeDefaut()
    }
  }, [user])

  async function initListeDefaut() {
    const { data: listes } = await supabase
      .from('listes')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .eq('is_template', false)
      .order('created_at', { ascending: false })
      .limit(1)

    if (listes && listes.length > 0) {
      setListeCourante(listes[0])
    } else {
      const { data } = await supabase
        .from('listes')
        .insert({ user_id: user.id, nom: 'Ma liste' })
        .select().single()
      if (data) setListeCourante(data)
    }
  }

  function handleSelectListe(liste) {
    setListeCourante(liste)
    setShowListes(false)
  }

  if (loading) return <LoadingScreen />
  if (!isSupabaseConfigured) return <BrowserRouter><AppLayout user={null} listeCourante={null} onChangerListe={() => {}} showListes={false} setShowListes={() => {}} onSelectListe={() => {}} /></BrowserRouter>
  if (!user) return <AuthScreen />

  return (
    <BrowserRouter>
      <AppLayout
        user={user}
        listeCourante={listeCourante}
        onChangerListe={() => setShowListes(true)}
        showListes={showListes}
        setShowListes={setShowListes}
        onSelectListe={handleSelectListe}
      />
    </BrowserRouter>
  )
}

function AppLayout({ user, listeCourante, onChangerListe, showListes, setShowListes, onSelectListe }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', backgroundColor: 'var(--color-bg)' }}>
      <div style={{ flex: 1, paddingBottom: '72px' }}>
        {showListes ? (
          <ListesScreen user={user} onSelectListe={onSelectListe} />
        ) : (
          <Routes>
            <Route path="/" element={<HomeScreen user={user} listeCourante={listeCourante} onChangerListe={onChangerListe} />} />
            <Route path="/resultats" element={<ResultScreen />} />
            <Route path="/detail/:id" element={<DetailScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
      <BottomNav showListes={showListes} onListesClick={() => setShowListes(!showListes)} />
    </div>
  )
}
