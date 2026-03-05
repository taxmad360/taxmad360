'use client'
import { useState, useEffect } from 'react'

export default function BuscadorDirecciones({ placeholder, onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    // TRUCO DE AHORRO: Solo busca si hay más de 4 letras y el usuario paró de escribir
    const timer = setTimeout(() => {
      if (query.length > 4) {
        buscarEnGoogle(query)
      }
    }, 500) // 500ms de espera

    return () => clearTimeout(timer)
  }, [query])

  const buscarEnGoogle = (text) => {
    if (!window.google) return
    
    const service = new window.google.maps.places.AutocompleteService()
    // Usamos 'sessionToken' para que Google agrupe las búsquedas y cobre menos
    service.getPlacePredictions({ input: text }, (predictions) => {
      setResults(predictions || [])
    })
  }

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="input-auth !mb-0" // Usamos tu clase de CSS
      />
      
      {results.length > 0 && (
        <ul className="absolute z-50 w-full bg-[#111] border border-zinc-800 rounded-b-xl mt-1 overflow-hidden shadow-2xl">
          {results.map((res) => (
            <li 
              key={res.place_id}
              onClick={() => {
                onSelect(res.description)
                setQuery(res.description)
                setResults([])
              }}
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
