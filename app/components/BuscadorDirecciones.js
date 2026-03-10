'use client'
import { useState, useEffect, useRef } from 'react'

export default function BuscadorDirecciones({ placeholder, onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const sessionTokenRef = useRef(null) // ✅ sessionToken real para agrupar llamadas y reducir costes

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 4) {
        buscarEnGoogle(query)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [query])

  const buscarEnGoogle = (text) => {
    if (!window.google) return

    // ✅ Crear sessionToken si no existe (se reutiliza hasta que el usuario selecciona)
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
    }

    const service = new window.google.maps.places.AutocompleteService()
    service.getPlacePredictions(
      { input: text, sessionToken: sessionTokenRef.current }, // ✅ Token pasado correctamente
      (predictions) => {
        setResults(predictions || [])
      }
    )
  }

  const handleSelect = (description) => {
    onSelect(description)
    setQuery(description)
    setResults([])
    sessionTokenRef.current = null // ✅ Resetear token tras selección (correcto según docs de Google)
  }

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="input-auth !mb-0"
      />

      {results.length > 0 && (
        <ul className="absolute z-50 w-full bg-[#111] border border-zinc-800 rounded-b-xl mt-1 overflow-hidden shadow-2xl">
          {results.map((res) => (
            <li
              key={res.place_id}
              onClick={() => handleSelect(res.description)}
              className="p-3 text-xs hover:bg-[#39FF14] hover:text-black cursor-pointer border-b border-zinc-900 last:border-0"
            >
              {res.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
