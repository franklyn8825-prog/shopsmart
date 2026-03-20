import { useState, useEffect } from 'react'

export function useLocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur.')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('Accès à la localisation refusé.')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('Position non disponible.')
        } else {
          setError('Impossible d\'obtenir votre position.')
        }
        setLoading(false)
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    )
  }

  return { location, error, loading, requestLocation }
}
